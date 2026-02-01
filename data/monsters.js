/**
 * Static Monster Data
 * Classification: Tier and Location
 */
const MONSTERS_DATA = [
    // --- TIER 1: Forest & Pinggiran ---
    { name: 'Slime', level: 1, location: 'Hutan Pinggiran', type: 'Normal', drops: ['Slime Gel', 'Gold Coin'] },
    { name: 'Goblin Scout', level: 3, location: 'Hutan Pinggiran', type: 'Normal', drops: ['Broken Dagger', 'Cloth'] },
    { name: 'Wild Boar', level: 5, location: 'Hutan Pinggiran', type: 'Aggressive', drops: ['Boar Meat', 'Tusk'] },
    { name: 'Horned Rabbit', level: 7, location: 'Padang Rumput', type: 'Normal', drops: ['Rabbit Fur', 'Horn'] },

    // --- TIER 2: Deep Forest & Caves ---
    { name: 'Dire Wolf', level: 12, location: 'Deep Forest', type: 'Aggressive', drops: ['Wolf Fang', 'Thick Fur'] },
    { name: 'Cave Bat', level: 15, location: 'Goa Gelap', type: 'Normal', drops: ['Bat Wing', 'Guano'] },
    { name: 'Skeleton Warrior', level: 18, location: 'Abandoned Catacombs', type: 'Undead', drops: ['Bone', 'Rusted Sword'] },
    { name: 'Orc Grunt', level: 20, location: 'Orc Camp', type: 'Humanoid', drops: ['Iron Ore', 'Orcish Axe'] },

    // --- TIER 3: Dungeon & Bosses ---
    { name: 'Golem', level: 25, location: 'Stone Temple', type: 'Construct', drops: ['Stone Heart', 'Heavy Stone'] },
    { name: 'Shadow Assassin', level: 30, location: 'Shadow Realm', type: 'Demon', drops: ['Shadow Essence', 'Black Cloth'] },
    { name: 'Dragon Wyrmling', level: 35, location: 'Dragon Peak', type: 'Dragon', drops: ['Dragon Scale', 'Fire Gland'] },

    // --- BOSSES ---
    { name: 'King Slime', level: 10, location: 'Slime Kingdom', type: 'Boss', drops: ['Royal Gel', 'King Crown'] },
    { name: 'Lich Lord', level: 40, location: 'Necropolis', type: 'Boss', drops: ['Soul Gem', 'Necro Staff'] },
    { name: 'High Dragon', level: 60, location: 'Dragon Peak Core', type: 'World Boss', drops: ['Dragon Heart', 'Legendary Scale'] }
];
