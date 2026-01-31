function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

/* --- MODAL SYSTEM --- */
const modal = document.getElementById('info-modal');
const modalBody = document.getElementById('modal-body');

function openModal(content) {
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
        modalBody.innerHTML = '';
    }, 300);
}

// Close on outside click
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

/* --- PLAYER PROFILE SYSTEM --- */
async function showCharacterProfile(userId) {
    try {
        // Show loading state
        openModal(`<div style="text-align:center; padding: 3rem;"><h2 class="glitch-text">ACCESSING ARCHIVES...</h2></div>`);

        const res = await fetch(`${API_URL}/character/${userId}`);
        if (!res.ok) throw new Error('Character not found');

        const data = await res.json();
        const { character, equipment, levels, inventory } = data;
        const stats = character.stats || {};
        const currency = character.currency || { gold: 0, silver: 0, bronze: 0 };

        const html = `
            <div class="modal-header">
                <h2 class="modal-title-glitch">${character.name}</h2>
                <div class="modal-subtitle">
                    ${character.race} ${character.class ? '• ' + character.class : ''} • Lvl ${levels.level}
                </div>
            </div>

            <div class="profile-layout">
                <!-- Sidebar: Details & Stats -->
                <aside class="profile-sidebar">
                    <div style="text-align:center; margin-bottom: 2rem;">
                        <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">${character.emoji || '👤'}</h1>
                        <span class="lvl-badge" style="font-size: 1rem;">Job: ${character.job || 'Unemployed'}</span>
                    </div>

                    <div class="stats-bars">
                        <!-- HP -->
                        <div class="bar-container">
                            <div class="bar-label"><span>HP</span><span>${stats.hp || 100} / ${stats.maxHp || 100}</span></div>
                            <div class="bar" style="background: rgba(255,255,255,0.1);">
                                <div class="hp-bar" style="width: 100%; height:100%;"></div>
                            </div>
                        </div>
                        <!-- MP -->
                        <div class="bar-container">
                            <div class="bar-label"><span>MP</span><span>${stats.mp || 50} / ${stats.maxMp || 50}</span></div>
                            <div class="bar" style="background: rgba(255,255,255,0.1);">
                                <div class="mp-bar" style="width: 100%; height:100%;"></div>
                            </div>
                        </div>
                <!-- Left Column: Bio & Main Stats -->
                <div class="profile-sidebar">
                    <div class="section-box">
                        <div class="box-title">IDENTITY</div>
                        <div style="margin-bottom: 1rem; font-style: italic; color: #ccc;">
                            "${character.description || 'No description provided.'}"
                        </div>
                        <div class="stat-row"><span>Combat Path</span> <span>${character.combatPath ? character.combatPath.toUpperCase() : '-'}</span></div>
                        <div class="stat-row"><span>Title</span> <span>${character.title || 'None'}</span></div>
                        <div class="stat-row"><span>Guild</span> <span>${character.guild || '-'}</span></div>
                    </div>

                    <div class="section-box">
                        <div class="box-title">SURVIVAL</div>
                        <div class="stat-row"><span>Health</span> <span style="color:#e74c3c">${Math.floor(survival.health)}%</span></div>
                        <div class="stat-row"><span>Hunger</span> <span style="color:#e67e22">${Math.floor(survival.hungry)}%</span></div>
                        <div class="stat-row"><span>Thirst</span> <span style="color:#3498db">${Math.floor(survival.thirst)}%</span></div>
                        <div class="stat-row"><span>Sleep</span> <span style="color:#9b59b6">${Math.floor(survival.sleep)}%</span></div>
                    </div>
                </div>

                <!-- Right Column: Detailed Stats -->
                <div class="profile-content">
                    <div class="section-box">
                        <div class="box-title">COMBAT ATTRIBUTES</div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-label">ATK</div>
                                <div class="stat-val">${stats.atk || 0}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">DEF</div>
                                <div class="stat-val">${stats.def || 0}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">MAGIC</div>
                                <div class="stat-val">${stats.magic || 0}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">MAG DEF</div>
                                <div class="stat-val">${stats.magicDef || 0}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">SPD</div>
                                <div class="stat-val">${stats.speed || 0}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">LUCK</div>
                                <div class="stat-val">${stats.luck || 0}</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="stat-row"><span>Crit Rate</span> <span>${stats.criticalRate || 0}%</span></div>
                            <div class="stat-row"><span>Crit Dmg</span> <span>${stats.criticalDamage || 0}%</span></div>
                            <div class="stat-row"><span>Pen. ATK</span> <span>${stats.penAtk || 0}</span></div>
                            <div class="stat-row"><span>Pen. Magic</span> <span>${stats.penMagic || 0}</span></div>
                        </div>
                    </div>

                    <div class="section-box">
                        <div class="box-title">PROFICIENCY & ADVANCEMENT</div>
                        <div class="stat-row"><span>Monsters Killed</span> <span>${character.advancement?.monstersKilled || 0}</span></div>
                        <div class="stat-row"><span>Items Crafted</span> <span>${character.advancement?.itemsCrafted || 0}</span></div>
                        <div class="stat-row"><span>Resources Gathered</span> <span>${character.advancement?.resourcesGathered || 0}</span></div>
                        <div class="stat-row"><span>Reputation</span> <span>${character.reputation || 0}</span></div>
                        <div class="stat-row"><span>PK Count</span> <span style="color:red">${character.killedPlayers || 0}</span></div>
                    </div>
                </div>
            </div>
        `;
        openModal(html);
    } catch (err) {
        console.error(err);
        openModal(`<div style="text-align:center; padding: 3rem;"><h3>Error loading profile</h3><p>${err.message}</p></div>`);
    }
}

function renderStatItem(label, value) {
    return `
        <div class="attr-item">
            <div class="attr-name-val"><span>${label}</span><span class="attr-val">${value || 0}</span></div>
        </div>
    `;
}

function renderEquipmentSlot(slotName, item) {
    const isEquipped = item && item.name;
    return `
        <div class="inv-item" style="${isEquipped ? 'border-color: var(--primary); background: rgba(138, 43, 226, 0.05);' : 'opacity: 0.5;'}">
            <div class="inv-icon">${isEquipped ? '⚔️' : '🛡️'}</div>
            <div class="inv-name">${isEquipped ? item.name : 'Empty'}</div>
            <div class="inv-qty" style="font-weight:normal; font-size: 0.7rem; color: var(--text-muted);">${slotName}</div>
        </div>
    `;
}

/* --- RACE DETAIL SYSTEM --- */
function renderRaceDetail(raceKey) {
    const race = RACES[raceKey];
    if (!race) return;

    const html = `
        <div class="modal-header">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${race.emoji}</div>
            <h2 class="modal-title-glitch" style="margin-bottom:0.5rem;">${race.name}</h2>
            <span class="tier-badge" style="position:relative; top:0; right:0; display:inline-block; margin-bottom: 2rem; background: var(--${race.tier.toLowerCase()});">${race.tier}</span>
        </div>
        
        <div style="padding: 0 10%; text-align: center;">
            <p style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 2rem; border-left: 3px solid var(--primary); padding-left: 1rem; text-align: left;">
                "${race.desc}"
            </p>
            
            <div class="section-box" style="text-align: left;">
                <h3 class="box-title">RACIAL TRAITS & BONUSES</h3>
                <p style="font-size: 1.1rem; color: var(--gold);">${race.stats}</p>
            </div>
        </div>
   `;
    openModal(html);
}

function renderRaceCards() {
    const grid = document.getElementById('race-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(RACES).map(([key, race]) => `
        <div class="race-card ${race.tier.toLowerCase()}" onclick="renderRaceDetail('${key}')">
            <div class="race-icon">${race.emoji}</div>
            <h3>${race.name}</h3>
            <span class="tier-badge">${race.tier}</span>
        </div>
    `).join('');
}

// Full Race Data (Preserved for Reference)
const RACES = {
    human: { name: 'Human', emoji: '👤', tier: 'Common', desc: 'Serba bisa dan mudah beradaptasi, unggul dalam belajar.', stats: 'EXP +10%, ATK +5%, Magic +5%' },
    elf: { name: 'Elf', emoji: '🧝', tier: 'Common', desc: 'Anggun dan magis, gesit serta tahan terhadap sihir.', stats: 'Atk Speed +8%, Mag Def +10%' },
    dwarf: { name: 'Dwarf', emoji: '🧔', tier: 'Common', desc: 'Kokoh dan tangguh, ahli dalam pertahanan.', stats: 'DEF +15%, ATK +5%, HP Max +10%' },
    orc: { name: 'Orc', emoji: '👹', tier: 'Common', desc: 'Kuat dan ganas, mendominasi dalam pertempuran fisik.', stats: 'ATK +15%, HP Max +10%' },
    halfling: { name: 'Halfling', emoji: '🧒', tier: 'Uncommon', desc: 'Kecil dan lincah, menyerang dengan kecepatan luar biasa.', stats: 'Atk Speed +20%, Speed +15%' },
    gnome: { name: 'Gnome', emoji: '🧙', tier: 'Uncommon', desc: 'Penemu jenius, sangat unggul dalam penggunaan sihir.', stats: 'Magic +25%, Spell Power +15%' },
    halfelf: { name: 'Half-Elf', emoji: '🧝‍♂️', tier: 'Uncommon', desc: 'Warisan campuran yang memberikan fleksibilitas.', stats: 'Speed +10%, Magic +10%, EXP +5%' },
    halforc: { name: 'Half-Orc', emoji: '👺', tier: 'Uncommon', desc: 'Kuat dan tangguh dengan darah Orc.', stats: 'ATK +15%, Pen Atk +8%, HP +10%' },
    darkelf: { name: 'Dark Elf', emoji: '🕷️', tier: 'Rare', desc: 'Penghuni bayangan dengan presisi mematikan.', stats: 'Crit Rate +15%, Speed +20%' },
    dragonborn: { name: 'Dragonborn', emoji: '🐉', tier: 'Rare', desc: 'Pejuang berdarah naga dengan kekuatan dahsyat.', stats: 'ATK +25%, HP +15%, Pen Atk +15%' },
    tiefling: { name: 'Tiefling', emoji: '😈', tier: 'Rare', desc: 'Warisan iblis dengan kecakapan sihir.', stats: 'Magic +25%, Mag Def +15%, DEF +15%' },
    beastkin: { name: 'Beastkin', emoji: '🐺', tier: 'Rare', desc: 'Insting hewan meningkatkan kemampuan tempur.', stats: 'Speed +20%, Atk Speed +15%, Accuracy +15%' },
    angel: { name: 'Angel', emoji: '👼', tier: 'Epic', desc: 'Makhluk surgawi pembawa cahaya.', stats: 'Magic +30%, Spell Power +20%, HP Regen +15%' },
    demon: { name: 'Demon', emoji: '👿', tier: 'Epic', desc: 'Makhluk neraka pembawa kehancuran.', stats: 'ATK +35%, Magic +35%, Lifesteal +20%' },
    ancientdragonkin: { name: 'Ancient Dragonkin', emoji: '🐲', tier: 'Mythical', desc: 'Darah naga kuno memberikan kekuatan mutlak.', stats: 'All Stats +30-40%, Godlike Tier' },
    etherealbeing: { name: 'Ethereal Being', emoji: '👻', tier: 'Mythical', desc: 'Entitas transenden dari sihir murni.', stats: 'Spell Power +50%, Cooldown -30%, Mana Regen +20%' }
};

// API Connection Configuration
// 1. If you are using Nura.host, put your HTTPS URL here:
const NURA_HOST_URL = 'http://nl-2.nura.host:25562';

const API_URL = (() => {
    // Priority 1: If opened as a local file (file://), use localhost
    if (window.location.protocol === 'file:') return 'http://localhost:3000/api';

    // Priority 2: Use relative path if running on the same server (Localhost / VPS)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname.includes('.')) {
        return '/api';
    }

    // Priority 3: GitHub Pages / Vercel -> Use the remote Nura.host URL
    if (window.location.hostname.includes('github.io') || window.location.hostname.includes('vercel.app')) {
        return `${NURA_HOST_URL}/api`;
    }

    return '/api';
})();

// Fetch Server Stats
async function loadServerStats() {
    try {
        const res = await fetch(`${API_URL}/stats`);
        const stats = await res.json();

        if (stats.totalPlayers !== undefined) {
            animateValue('stat-players', 0, stats.totalPlayers, 1500);
        }
        if (stats.discordMembers !== undefined) {
            animateValue('stat-discord', 0, stats.discordMembers, 1500);
        }
        if (stats.chillMembers !== undefined) {
            animateValue('stat-chill', 0, stats.chillMembers, 1500);
        }
    } catch (err) {
        console.error('Failed to load stats', err);
    }
}

// Character Grid State
let currentPage = 1;
let currentSort = 'rpg'; // Renamed from currentLeaderboardType for clarity
const ITEMS_PER_PAGE = 10;

// Switch Category / Sort
function switchLeaderboard(type) {
    currentSort = type;
    currentPage = 1; // Reset to page 1

    // Update Active Button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.querySelector(`button[onclick="switchLeaderboard('${type}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Reload Data
    loadCharacters();
}

// Change Page
function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage < 1) return;

    currentPage = newPage;
    loadCharacters();
}

// Search State
let searchTerm = '';

function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const input = document.getElementById('char-search');
    searchTerm = input.value.trim();
    currentPage = 1; // Reset to first page
    loadCharacters();
}

// Fetch Characters
async function loadCharacters() {
    try {
        const grid = document.getElementById('character-grid');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageInd = document.getElementById('page-indicator');

        // Update Controls State immediately
        if (pageInd) pageInd.innerText = `Page ${currentPage}`;
        if (prevBtn) prevBtn.disabled = currentPage <= 1;

        // Fade out slightly to indicate loading
        if (grid) grid.style.opacity = '0.5';

        const res = await fetch(`${API_URL}/leaderboard?type=${currentSort}&limit=${ITEMS_PER_PAGE}&page=${currentPage}&search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();

        // Clear grid (Pagination always replaces)
        if (grid) {
            grid.innerHTML = '';
            grid.style.opacity = '1';
        }

        if (data.length === 0 && currentPage === 1) {
            if (grid) grid.innerHTML = `<div class="empty-msg" style="grid-column: 1/-1;">No characters found.</div>`;
            if (nextBtn) nextBtn.disabled = true;
        } else {
            // Check if we reached the end
            if (nextBtn) {
                // If we got fewer items than limit, it's the last page
                nextBtn.disabled = data.length < ITEMS_PER_PAGE;
            }

            data.forEach(p => {
                const card = document.createElement('div');
                card.className = 'char-card';

                // Only allow clicking if they have a character profile
                // For 'general' type, hasCharacter is explicitly false for non-registered users
                // For other types, it's undefined (assumed true as they come from Character DB)
                if (currentSort === 'race') {
                    card.onclick = () => renderRaceDetail(p.name.toLowerCase().replace(/\s/g, ''));
                } else if (currentSort === 'clan') {
                    card.onclick = () => showClanProfile(p.clanId);
                } else if (p.hasCharacter === false) {
                    card.style.cursor = 'default';
                    card.onclick = () => {
                        openModal(`<div style="text-align:center; padding: 2rem;">
                            <h3>Not Registered</h3>
                            <p>This user has not created an RPG character yet.</p>
                         </div>`);
                    };
                } else {
                    card.onclick = () => showCharacterProfile(p.userId);
                }

                card.innerHTML = renderCharacterCard(p);
                grid.appendChild(card);
            });
        }
    } catch (err) {
        console.error('Failed to load characters', err);
        const grid = document.getElementById('character-grid');
        if (grid) {
            grid.innerHTML = `<div class="error-msg" style="grid-column: 1/-1; color: var(--danger);">Failed to load data.</div>`;
            grid.style.opacity = '1';
        }
    }
}

// Show Clan Profile
async function showClanProfile(clanId) {
    const modal = document.getElementById('info-modal');
    const body = document.getElementById('modal-body');

    body.innerHTML = '<div class="loading-spinner">Loading Clan Data...</div>';
    modal.style.display = 'flex';
    setTimeout(() => modal.style.opacity = '1', 10);

    try {
        const res = await fetch(`${API_URL}/clan/${clanId}`);
        const clan = await res.json();

        if (clan.error) {
            body.innerHTML = `<div class="error-msg">${clan.error}</div>`;
            return;
        }

        const leader = clan.members.find(m => m.role === 'leader');

        body.innerHTML = `
            <div class="profile-header" style="text-align:center; border-bottom:1px solid var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;">
                <div class="profile-avatar" style="font-size:3rem;">🏰</div>
                <h2 style="font-family:'Philosopher'; font-size:2rem; color:var(--gold); margin:0.5rem 0;">${clan.name}</h2>
                <div class="profile-meta" style="color:var(--text-muted); font-size:0.9rem;">Level ${clan.level} Guild • Leader: ${leader ? leader.name : 'Unknown'}</div>
                <div class="profile-desc" style="margin-top:1rem; font-style:italic;">"${clan.description || 'No description.'}"</div>
            </div>

            <div class="profile-stats" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="stat-item" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:10px; text-align:center;">
                    <div class="stat-label" style="font-size:0.8rem; color:var(--text-muted);">MEMBERS</div>
                    <div class="stat-value" style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${clan.members.length} / ${clan.settings.maxMembers}</div>
                </div>
                <div class="stat-item" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:10px; text-align:center;">
                    <div class="stat-label" style="font-size:0.8rem; color:var(--text-muted);">POINTS</div>
                    <div class="stat-value" style="font-size:1.2rem; font-weight:bold; color:var(--gold);">${formatCompactNumber(clan.stats.points)}</div>
                </div>
                <div class="stat-item" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:10px; text-align:center;">
                    <div class="stat-label" style="font-size:0.8rem; color:var(--text-muted);">TREASURY (G)</div>
                    <div class="stat-value" style="font-size:1.2rem; font-weight:bold; color:var(--gold);">${formatCompactNumber(clan.treasury.gold)}</div>
                </div>
                <div class="stat-item" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:10px; text-align:center;">
                    <div class="stat-label" style="font-size:0.8rem; color:var(--text-muted);">STATUS</div>
                    <div class="stat-value" style="font-size:1.2rem; font-weight:bold; color:#fff; text-transform:uppercase;">${clan.settings.status}</div>
                </div>
            </div>

            <h3 style="margin-bottom:0.5rem; color:var(--text-main); font-size:1.1rem;">Top Members</h3>
            <div class="attr-list" style="max-height: 200px;">
                ${clan.members.sort((a, b) => (b.contribution || 0) - (a.contribution || 0)).slice(0, 5).map(m => `
                    <div class="attr-item" style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:bold; color:${m.role === 'leader' ? 'var(--gold)' : '#fff'}">${m.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">${m.job} • Lvl ${m.level}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.8rem; color:var(--primary); text-transform:uppercase;">${m.role}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${formatCompactNumber(m.contribution)} XP</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (err) {
        console.error('Clan Details Error:', err);
        body.innerHTML = `<div class="error-msg">Failed to load clan details.</div>`;
    }
}


const formatCompactNumber = (number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

function renderCharacterCard(p) {
    const raceEmoji = getRaceEmoji(p.race || 'human');
    let avatar = p.emoji || raceEmoji;
    let name = p.name || 'Unknown';
    let meta = `${p.race || 'Human'} • ${p.job || 'Novice'}`;

    // Default Stats (RPG / General)
    let stats = [
        { label: 'LVL', val: p.level || 1 },
        { label: 'ATK', val: p.stats?.atk || p.stats?.attack || 0 },
        { label: 'DEF', val: p.stats?.def || p.stats?.defense || 0 }
    ];

    // Dynamic Content based on Category
    switch (currentSort) {
        case 'general':
            // General uses MemberLevel, so job is 'Member' usually
            meta = `${p.race || 'User'} • Level ${p.level}`;
            stats = [
                { label: 'LVL', val: p.level },
                { label: 'XP', val: formatCompactNumber(p.xp || 0) },
                { label: 'JOB', val: p.job || 'Member' }
            ];
            break;

        case 'money':
            meta = `Wealthy Elite`;
            stats = [
                { label: 'WEALTH', val: formatCompactNumber(p.totalMoney || 0) },
                { label: 'LVL', val: p.level || 1 },
                { label: 'JOB', val: p.job || 'Merchant' }
            ];
            break;

        case 'rp':
            meta = `Roleplayer`;
            stats = [
                { label: 'RP Points', val: p.rp || 0 },
                { label: 'LVL', val: p.level || 1 },
                { label: 'RACE', val: p.race || 'Human' }
            ];
            break;

        case 'clan':
            // Clan Object Structure: { name, level, stats: { points } }
            avatar = '🏰';
            name = p.name;
            meta = `Level ${p.level} Guild`;
            stats = [
                { label: 'LEVEL', val: p.level },
                { label: 'POINTS', val: formatCompactNumber(p.stats?.points || 0) },
                { label: 'MEMBERS', val: p.members?.length || '?' }
            ];
            break;

        case 'pk':
            meta = `Serial Killer`;
            stats = [
                { label: 'KILLS', val: p.killedPlayers || 0 },
                { label: 'BOUNTY', val: formatCompactNumber(p.bounty || 0) },
                { label: 'TITLE', val: p.title || 'None' }
            ];
            break;

        case 'bounty':
            meta = `Wanted Criminal`;
            stats = [
                { label: 'BOUNTY', val: formatCompactNumber(p.bounty || 0) },
                { label: 'LVL', val: p.level || 1 },
                { label: 'JOB', val: p.job || 'Outlaw' }
            ];
            break;

        case 'race':
            // Race Object: { name, count, emoji }
            avatar = p.emoji;
            name = p.name;
            meta = 'Racial Population';
            stats = [
                { label: 'POPULATION', val: p.count },
                { label: 'TIER', val: RACES[p.name.toLowerCase().replace(/\s/g, '')]?.tier || '?' },
                { label: 'ACTIVE', val: 'Yes' }
            ];
            break;

        case 'gatherer':
            meta = `Master Gatherer`;
            stats = [
                { label: 'GATHERED', val: formatCompactNumber(p.advancement?.resourcesGathered || 0) },
                { label: 'LVL', val: p.level || 1 },
                { label: 'JOB', val: p.job || 'Worker' }
            ];
            break;

        case 'crafter':
            meta = `Master Smith`;
            stats = [
                { label: 'CRAFTED', val: formatCompactNumber(p.advancement?.itemsCrafted || 0) },
                { label: 'LVL', val: p.level || 1 },
                { label: 'JOB', val: p.job || 'Smith' }
            ];
            break;

        case 'hunter':
            meta = `Monster Slayer`;
            stats = [
                { label: 'KILLS', val: formatCompactNumber(p.advancement?.monstersKilled || 0) },
                { label: 'LVL', val: p.level || 1 },
                { label: 'JOB', val: p.job || 'Hunter' }
            ];
            break;

        case 'boss':
            meta = `Raid Legend`;
            stats = [
                { label: 'BOSSES', val: p.advancement?.bossesKilled || 0 },
                { label: 'LVL', val: p.level || 1 },
                { label: 'JOB', val: p.job || 'Slayer' }
            ];
            break;

        case 'heroes':
            meta = `Guardian`;
            stats = [
                { label: 'REP', val: p.reputation || 0 },
                { label: 'LVL', val: p.level || 1 },
                { label: 'TITLE', val: p.title || 'Hero' }
            ];
            break;

        case 'villains':
            meta = `Villain`;
            stats = [
                { label: 'REP', val: p.reputation || 0 },
                { label: 'LVL', val: p.level || 1 },
                { label: 'TITLE', val: p.title || 'Villain' }
            ];
            break;
    }

    return `
        <div class="char-avatar">${avatar}</div>
        <div class="char-name">${name}</div>
        <div class="char-meta">${meta}</div>

        <div class="char-stats-mini">
            ${stats.map(s => `
            <div class="stat-mini">
                <span class="stat-mini-val">${s.val}</span>
                <span class="stat-mini-lbl">${s.label}</span>
            </div>
            `).join('')}
        </div>
    `;
}

function getRaceEmoji(raceName) {
    if (!raceName) return '👤';
    const key = raceName.toLowerCase().replace(/\s+/g, '');
    return RACES[key]?.emoji || '👤';
}

// Helper: Number Animation
function animateValue(id, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    const current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    const obj = document.getElementById(id);

    let timer = setInterval(function () {
        start += increment;
        obj.innerHTML = start;
        if (start == end) {
            clearInterval(timer);
        }
    }, stepTime > 0 ? stepTime : 10);
}

// Init
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.glass-nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(10, 5, 20, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 5, 20, 0.8)';
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadServerStats();
    loadCharacters();
    renderRaceCards();

    // Activity Ticker
    fetchActivities();
    setInterval(fetchActivities, 60000);
});

// Fetch Activity Logs
async function fetchActivities() {
    try {
        const res = await fetch(`${API_URL}/activity`);
        const logs = await res.json();

        const tickerContainer = document.getElementById('activity-ticker');
        if (!tickerContainer) return;

        if (logs.length === 0) {
            tickerContainer.innerHTML = '<div class="ticker-item">Welcome to Nihilthoria! Prepare for your journey...</div>';
            return;
        }

        const html = logs.map(log => {
            let icon = '📢';
            if (log.type === 'death') icon = '💀';
            if (log.type === 'kill') icon = '⚔️';
            if (log.type === 'market') icon = '💰';
            if (log.type === 'event') icon = '🌟';

            // Extract time
            const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="ticker-item">
                    <span style="opacity:0.7">[${time}]</span> 
                    <span>${icon} ${log.message}</span>
                </div>
            `;
        }).join('');

        tickerContainer.innerHTML = html;

        // Reset animation logic could go here if needed to restart flow smoothly, 
        // but replacing HTML works for simple ticker
    } catch (err) {
        console.error('Ticker Error:', err);
    }
}
// Real-time Updates (every 10 seconds)
setInterval(() => loadCharacters(), 30000); // Only refresh current page
setInterval(loadServerStats, 30000);

// Initial Market Load
loadMarket();

// Market Functions
async function loadMarket() {
    const grid = document.getElementById('market-grid');
    const loading = document.getElementById('market-loading');

    if (loading) loading.style.display = 'block';
    if (grid) grid.style.opacity = '0.5';

    try {
        const res = await fetch(`${API_URL}/market`);
        const listings = await res.json();

        if (grid) {
            grid.innerHTML = '';
            grid.style.opacity = '1';

            if (listings.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; color:var(--text-muted); padding:2rem;">No active auctions found.</div>';
            } else {
                listings.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'market-card';
                    // Inline styling for market card
                    card.style.background = 'rgba(255, 255, 255, 0.05)';
                    card.style.border = '1px solid var(--glass-border)';
                    card.style.borderRadius = '15px';
                    card.style.padding = '1.5rem';
                    card.style.textAlign = 'left';
                    card.style.transition = '0.3s';
                    card.onmouseover = () => { card.style.borderColor = 'var(--primary)'; card.style.transform = 'translateY(-5px)'; };
                    card.onmouseout = () => { card.style.borderColor = 'var(--glass-border)'; card.style.transform = 'translateY(0)'; };

                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                            <div style="font-size:2rem;">📦</div>
                            <div style="background:var(--primary); color:#fff; padding:0.2rem 0.6rem; border-radius:4px; font-size:0.7rem; font-weight:bold;">AUCTION</div>
                        </div>
                        <h3 style="color:var(--text-main); font-size:1.1rem; margin-bottom:0.5rem;">${item.item.name} <span style="color:var(--text-muted); font-size:0.9rem;">x${item.item.quantity}</span></h3>
                        <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:1rem;">Seller: <span style="color:#fff;">${item.sellerName}</span></div>
                        
                        <div style="background:rgba(0,0,0,0.3); padding:0.8rem; border-radius:8px; margin-bottom:1rem;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.3rem;">
                                <span>Current Bids</span>
                                <span style="color:var(--primary); font-weight:bold;">${item.bids ? item.bids.length : 0}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:bold; color:var(--gold);">
                                <span>Price</span>
                                <span>${formatCurrency(item.price)}</span>
                            </div>
                        </div>

                        <div style="font-size:0.75rem; color:var(--text-muted); text-align:right;">
                            Ends in: ${calculateTimeRemaining(item.endTime)}
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
        }
    } catch (err) {
        console.error('Market Error:', err);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function formatCurrency(money) {
    // Check if money is object or number
    if (typeof money === 'number') return `${formatCompactNumber(money)} G`;

    // Assume object { platinum, gold, silver, bronze }
    let parts = [];
    if (money.platinum) parts.push(`${money.platinum}💎`);
    if (money.gold) parts.push(`${money.gold}🥇`);
    if (money.silver) parts.push(`${money.silver}🥈`);
    // Skip bronze to save space if higher notes exist, or show if only bronze
    if (parts.length === 0 || (!money.platinum && !money.gold && !money.silver)) {
        if (money.bronze) parts.push(`${money.bronze}🥉`);
    }
    return parts.join(' ') || '0';
}

function calculateTimeRemaining(endTime) {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

