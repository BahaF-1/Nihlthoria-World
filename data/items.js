/**
 * Static Item & Recipe Data
 */
const ITEMS_DATA = [
    // Materials
    { name: 'Iron Ore', type: 'Material', desc: 'Bijih besi mentah. Bisa dilebur menjadi Iron Ingot.' },
    { name: 'Wood', type: 'Material', desc: 'Kayu dasar untuk crafting.' },
    { name: 'Slime Gel', type: 'Material', desc: 'Gel lengket dari Slime.' },

    // Consumables
    { name: 'Health Potion', type: 'Consumable', desc: 'Memulihkan 50 HP.' },
    { name: 'Mana Potion', type: 'Consumable', desc: 'Memulihkan 30 MP.' },

    // Equipment
    { name: 'Iron Sword', type: 'Weapon', desc: 'Pedang besi standar. ATK +10.' },
    { name: 'Leather Armor', type: 'Armor', desc: 'Armor kulit ringan. DEF +5.' }
];

const RECIPES_DATA = [
    { result: 'Iron Sword', ingredients: [{ name: 'Iron Ingot', qty: 2 }, { name: 'Wood', qty: 1 }], prof: 'Blacksmith Lv.1' },
    { result: 'Health Potion', ingredients: [{ name: 'Herb', qty: 2 }, { name: 'Water', qty: 1 }], prof: 'Alchemist Lv.1' },
    { result: 'Leather Armor', ingredients: [{ name: 'Leather', qty: 5 }, { name: 'Thread', qty: 2 }], prof: 'Tailor Lv.1' }
];
