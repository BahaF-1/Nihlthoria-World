const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || process.env.WEB_PORT || 25562;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for Web API'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models (Use existing models if already loaded, otherwise create with flexible schema)
const Character = mongoose.models.Character || mongoose.model('Character', new mongoose.Schema({}, { strict: false }));
const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', new mongoose.Schema({}, { strict: false }));
const MemberLevel = mongoose.models.MemberLevel || mongoose.model('MemberLevel', new mongoose.Schema({}, { strict: false }));
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', new mongoose.Schema({}, { strict: false }));
const WebLog = require('../src/models/WebLog');
const Clan = require('../src/models/Clan');
const AuctionListing = require('../src/models/AuctionListing');

// Utils
const { aggregateStats } = require('../src/utils/statsCalculator');

function calculateEquipmentBonus(equipmentData) {
    if (!equipmentData || !equipmentData.slots) return {};

    let bonus = {};
    Object.values(equipmentData.slots).forEach(item => {
        if (item && item.stats) {
            Object.entries(item.stats).forEach(([key, val]) => {
                bonus[key] = (bonus[key] || 0) + val;
            });
        }
    });
    return bonus;
}

// Export a function to start the server with Client access
module.exports = (client) => {
    // API: Get Character Data
    app.get('/api/character/:id', async (req, res) => {
        try {
            const id = req.params.id;
            let character;

            // Try finding by Discord ID first (user preference)
            character = await Character.findOne({ userId: id }).lean();

            // If not found, try by ObjectId (Character Code)
            if (!character && mongoose.Types.ObjectId.isValid(id)) {
                character = await Character.findById(id).lean();
            }

            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }

            // Fetch related data
            const [equipment, levels, inventory] = await Promise.all([
                Equipment.findOne({ userId: character.userId }).lean(),
                MemberLevel.findOne({ userId: character.userId }).lean(),
                Inventory.findOne({ userId: character.userId }).lean()
            ]);

            // Calculate Stats
            const equipmentBonus = equipment ? calculateEquipmentBonus(equipment) : {};
            const finalStats = aggregateStats(character, equipmentBonus);

            // Attach calculated stats to character object for frontend
            character.stats = finalStats.raw;
            character.derivedStats = finalStats; // Include derived like AC, critRange

            res.json({
                character,
                equipment: equipment || { slots: {} },
                levels: levels || { level: 1, xp: 0 },
                inventory: inventory || { items: [] }
            });
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // API: Leaderboard
    app.get('/api/leaderboard', async (req, res) => {
        try {
            const type = req.query.type || 'rpg';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const search = req.query.search || ''; // Get search term
            const skip = (page - 1) * limit;

            let data = [];

            // Base filter for name search (case-insensitive)
            // Note: Some models might rely on 'name', others (like general) need to join first
            const searchFilter = search ? { name: { $regex: search, $options: 'i' } } : {};

            // DIRECT QUERY HANDLERS (Bypassing strict Guild filters for Web visibility)
            if (type === 'rpg') {
                data = await Character.find({ ...searchFilter }, 'userId name race class level job xp currency description stats')
                    .sort({ level: -1, xp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'general') {
                // General uses MemberLevel (Chat XP) which doesn't have name directly
                // Strategy: Get matching UserIDs from Character if searching by name, 
                // OR fetch all memberlevels and filter in memory if dataset is small.
                // For scalable solution:
                let userIds = null;
                if (search) {
                    const matchedChars = await Character.find({ ...searchFilter }, 'userId').lean();
                    userIds = matchedChars.map(c => c.userId);
                }

                // Query MemberLevel
                const query = userIds ? { userId: { $in: userIds } } : {};
                const levels = await MemberLevel.find(query)
                    .sort({ level: -1, xp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                // Hydrate with Character names if available
                const finalUserIds = levels.map(l => l.userId);
                const characters = await Character.find({ userId: { $in: finalUserIds } }, 'userId name emoji race').lean();

                data = levels.map(l => {
                    const char = characters.find(c => c.userId === l.userId);
                    return {
                        userId: l.userId,
                        name: char ? char.name : 'Unknown User',
                        level: l.level,
                        xp: l.xp,
                        race: char ? char.race : 'Human',
                        emoji: char ? char.emoji : '👤',
                        job: 'Member',
                        hasCharacter: !!char
                    };
                });

            } else if (type === 'bounty') {
                data = await Character.find({ bounty: { $gt: 0 }, ...searchFilter }, 'userId name level bounty race job')
                    .sort({ bounty: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'money') {
                const allChars = await Character.find({ ...searchFilter }, 'userId name job currency').lean();
                const LeaderboardRenderer = require('../src/utils/leaderboardRenderer');

                data = allChars.map(c => ({
                    ...c,
                    totalMoney: LeaderboardRenderer.calculateTotalMoney(c.currency || {})
                }))
                    .sort((a, b) => b.totalMoney - a.totalMoney)
                    .slice(skip, skip + limit);

            } else if (type === 'race') {
                const results = await Character.aggregate([
                    { $group: { _id: '$race', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]);

                const { RACES } = require('../src/data/races/base');
                data = results.map(r => ({
                    name: RACES[r._id]?.name || r._id,
                    count: r.count,
                    emoji: RACES[r._id]?.emoji || '❓'
                }));
                // Race doesn't need pagination usually, but for consistency if list grows
                data = data.slice(skip, skip + limit);

            } else if (type === 'pk') {
                data = await Character.find({ killedPlayers: { $gt: 0 }, ...searchFilter }, 'userId name title killedPlayers bounty')
                    .sort({ killedPlayers: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'rp') {
                data = await Character.find({ rp: { $exists: true }, ...searchFilter }, 'userId name race rp level')
                    .sort({ rp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'clan') {
                try {
                    const Clan = mongoose.model('Clan');
                    data = await Clan.find({})
                        .sort({ level: -1, 'stats.points': -1 })
                        .skip(skip)
                        .limit(limit)
                        .lean();
                } catch (e) {
                    console.log("Clan fetch error", e);
                    data = [];
                }

            } else if (type === 'gatherer') {
                data = await Character.find({ 'advancement.resourcesGathered': { $gt: 0 }, ...searchFilter }, 'userId name job advancement.resourcesGathered')
                    .sort({ 'advancement.resourcesGathered': -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'crafter') {
                data = await Character.find({ 'advancement.itemsCrafted': { $gt: 0 }, ...searchFilter }, 'userId name job advancement.itemsCrafted')
                    .sort({ 'advancement.itemsCrafted': -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'heroes') {
                data = await Character.find({ reputation: { $gt: 0 }, ...searchFilter }, 'userId name reputation')
                    .sort({ reputation: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'villains') {
                data = await Character.find({ reputation: { $lt: 0 }, ...searchFilter }, 'userId name reputation')
                    .sort({ reputation: 1 }) // Ascending (most negative first)
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'hunter') {
                data = await Character.find({ 'advancement.monstersKilled': { $gt: 0 }, ...searchFilter }, 'userId name level advancement.monstersKilled')
                    .sort({ 'advancement.monstersKilled': -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            } else if (type === 'boss') {
                data = await Character.find({ 'advancement.bossesKilled': { $gt: 0 }, ...searchFilter }, 'userId name level advancement.bossesKilled')
                    .sort({ 'advancement.bossesKilled': -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();
            }

            res.json(data);
        } catch (error) {
            console.error('Leaderboard Error:', error);
            res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
    });

    // API: Clan Data
    app.get('/api/clan/:id', async (req, res) => {
        try {
            const clan = await Clan.findOne({ clanId: req.params.id }).lean();
            if (!clan) return res.status(404).json({ error: 'Clan not found' });

            // Hydrate member names (optional but good for display)
            const memberIds = clan.members.map(m => m.userId);
            const characters = await Character.find({ userId: { $in: memberIds } }, 'userId name level job race').lean();

            clan.members = clan.members.map(m => {
                const char = characters.find(c => c.userId === m.userId);
                return {
                    ...m,
                    name: char ? char.name : 'Unknown',
                    level: char ? char.level : 1,
                    job: char ? char.job : 'Member',
                    race: char ? char.race : 'Human'
                };
            });

            res.json(clan);
        } catch (error) {
            console.error('Clan API Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // API: Market / Auction House
    app.get('/api/market', async (req, res) => {
        try {
            const listings = await AuctionListing.find({ active: true, endTime: { $gt: new Date() } })
                .sort({ endTime: 1 })
                .lean();
            res.json(listings);
        } catch (error) {
            console.error('Market API Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // API: Activity Feed
    app.get('/api/activity', async (req, res) => {
        try {
            const logs = await WebLog.find({})
                .sort({ timestamp: -1 })
                .limit(10)
                .lean();
            res.json(logs);
        } catch (error) {
            console.error('Activity Feed Error:', error);
            res.status(500).json({ error: 'Failed' });
        }
    });

    // API: Server Stats
    app.get('/api/stats', async (req, res) => {
        try {
            const totalPlayers = await Character.countDocuments();

            let discordMembers = 0;
            let chillMembers = 0;
            const CHILL_ROLE_ID = '1454712140450627757';


            // Ensure database connection
            if (mongoose.connection.readyState !== 1) {
                console.warn('[Stats] MongoDB not connected yet. State:', mongoose.connection.readyState);
            }

            // Attempt to get Discord data
            if (client && client.isReady()) {
                // If cache is empty, try to fetch guilds forcefull
                if (client.guilds.cache.size === 0) {
                    try {
                        console.log('[Stats] Cache empty. Fetching guilds...');
                        await client.guilds.fetch();
                        console.log(`[Stats] Fetched guilds. Count: ${client.guilds.cache.size}`);
                    } catch (err) {
                        console.error('[Stats] Guild fetch failed:', err);
                    }
                }

                if (client.guilds.cache.size > 0) {
                    // Calculate total members
                    discordMembers = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
                    console.log(`[Stats] Total Discord Members: ${discordMembers}`);

                    // Calculate chill members
                    for (const [guildId, guild] of client.guilds.cache) {
                        try {
                            // Ensure members are cached for accuracy
                            if (guild.memberCount !== guild.members.cache.size) {
                                try {
                                    await guild.members.fetch();
                                    console.log(`[Stats] Fetched members for guild ${guild.name}`);
                                } catch (e) { console.log(`[Stats] Failed to fetch members for ${guild.name}`); }
                            }

                            // Check Role
                            const chillRole = guild.roles.cache.get(CHILL_ROLE_ID);

                            // If role exists, check its members
                            if (chillRole) {
                                chillMembers += chillRole.members.size;
                            }

                            // Fallback: Filter members manually if role members seem empty but role exists
                            // Or if role wasn't found in cache but might exist?
                            // This iteration is expensive on large guilds but necessary if cache is partial
                            if (!chillRole || (chillRole.members.size === 0 && guild.memberCount > 0)) {
                                const count = guild.members.cache.filter(m => m.roles.cache.has(CHILL_ROLE_ID)).size;
                                chillMembers = Math.max(chillMembers, count); // Simple max to avoid double counting if logic overlaps awkwardly
                            }
                        } catch (e) { /* ignore individual guild errors */ }
                    }
                    console.log(`[Stats] Total Chill Members: ${chillMembers}`);
                }
            } else {
                console.log(`[Stats] Client Status - Present: ${!!client}, Ready: ${client ? client.isReady() : 'No Client'}`);
            }

            res.json({
                totalPlayers,
                discordMembers,
                chillMembers
            });
        } catch (err) {
            console.error('Stats Error:', err);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    });

    // ========== ADMIN PERMISSION APIs ==========
    const CommandPermission = require('../src/models/CommandPermission');

    // Admin Login
    app.post('/api/admin/login', async (req, res) => {
        const { password } = req.body;

        // Always accept default password first
        if (password === 'Morgana') {
            return res.json({ success: true });
        }

        // Then check database for custom password
        try {
            const guildId = client?.guilds?.cache?.first()?.id;
            if (guildId) {
                const config = await CommandPermission.getOrCreate(guildId);
                if (password === config.adminPassword) {
                    return res.json({ success: true });
                }
            }
        } catch (err) {
            console.error('Login check error:', err);
        }

        res.json({ success: false });
    });

    // Get all guilds
    app.get('/api/guilds', (req, res) => {
        if (!client || !client.guilds) {
            return res.json([]);
        }

        const guilds = client.guilds.cache.map(g => ({
            id: g.id,
            name: g.name,
            memberCount: g.memberCount
        }));

        res.json(guilds);
    });

    // Get guild roles
    app.get('/api/roles/:guildId', async (req, res) => {
        const { guildId } = req.params;

        try {
            const guild = client?.guilds?.cache?.get(guildId);
            if (!guild) {
                return res.json([]);
            }

            const roles = guild.roles.cache
                .filter(r => r.id !== guild.id) // Filter out @everyone
                .sort((a, b) => b.position - a.position)
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.hexColor,
                    position: r.position
                }));

            res.json(roles);
        } catch (err) {
            console.error('Roles Error:', err);
            res.json([]);
        }
    });

    // Get permissions for guild
    app.get('/api/permissions/:guildId', async (req, res) => {
        const { guildId } = req.params;

        try {
            const config = await CommandPermission.getOrCreate(guildId);
            res.json({
                guildId: config.guildId,
                permissions: config.getAllPermissions()
            });
        } catch (err) {
            console.error('Permissions Error:', err);
            res.status(500).json({ error: 'Failed to fetch permissions' });
        }
    });

    // Add role to command permission
    app.post('/api/permissions/:guildId', async (req, res) => {
        const { guildId } = req.params;
        const { commandName, roleId } = req.body;

        try {
            const config = await CommandPermission.getOrCreate(guildId);
            config.addRoleToCommand(commandName, roleId);
            await config.save();

            res.json({ success: true });
        } catch (err) {
            console.error('Add Permission Error:', err);
            res.status(500).json({ error: 'Failed to add permission' });
        }
    });

    // Remove role from command permission
    app.delete('/api/permissions/:guildId', async (req, res) => {
        const { guildId } = req.params;
        const { commandName, roleId } = req.body;

        try {
            const config = await CommandPermission.getOrCreate(guildId);
            config.removeRoleFromCommand(commandName, roleId);
            await config.save();

            res.json({ success: true });
        } catch (err) {
            console.error('Remove Permission Error:', err);
            res.status(500).json({ error: 'Failed to remove permission' });
        }
    });

    // Add new command permission entry
    app.post('/api/permissions/:guildId/command', async (req, res) => {
        const { guildId } = req.params;
        const { commandName, description } = req.body;

        try {
            const config = await CommandPermission.getOrCreate(guildId);

            // Check if command already exists
            const exists = config.permissions.find(p => p.commandName === commandName);
            if (exists) {
                return res.status(400).json({ error: 'Command already exists' });
            }

            config.permissions.push({
                commandName,
                allowedRoles: [],
                description: description || ''
            });
            await config.save();

            res.json({ success: true });
        } catch (err) {
            console.error('Add Command Error:', err);
            res.status(500).json({ error: 'Failed to add command' });
        }
    });

    app.listen(PORT, () => {
        console.log(`Web Dashboard Server running at http://localhost:${PORT}`);
    });
};
};
