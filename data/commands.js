/**
 * Static Command List
 * Categories: RPG, Combat, Social, System, Admin
 */
const COMMANDS_DATA = [
    // --- MAIN RPG ---
    { cmd: '/start', prefix: '.start', desc: 'Memulai petualangan barumu di Nihilthoria.', category: 'RPG' },
    { cmd: '/profile', prefix: '.profile', desc: 'Melihat status karakter, HP, MP, dan Stats.', category: 'RPG' },
    { cmd: '/inventory', prefix: '.inv', desc: 'Membuka tas penyimpanan item.', category: 'RPG' },
    { cmd: '/equip', prefix: '.equip', desc: 'Memasang equipment ke karakter.', category: 'RPG' },
    { cmd: '/unequip', prefix: '.unequip', desc: 'Melepas equipment yang terpasang.', category: 'RPG' },
    { cmd: '/stats', prefix: '.stats', desc: 'Melihat detail status tempur (ATK, DEF, dll).', category: 'RPG' },
    { cmd: '/use', prefix: '.use', desc: 'Menggunakan item consumable (potion, food).', category: 'RPG' },

    // --- COMBAT & ACTION ---
    { cmd: '/hunt', prefix: '.hunt', desc: 'Berburu monster di lokasi saat ini.', category: 'Combat' },
    { cmd: '/dungeon', prefix: '.dungeon', desc: 'Masuk ke dungeon instanced (Party req).', category: 'Combat' },
    { cmd: '/pvp', prefix: '.pvp', desc: 'Menantang pemain lain untuk duel.', category: 'Combat' },
    { cmd: '/heal', prefix: '.heal', desc: 'Menyembuhkan diri sendiri atau teman (Priest only).', category: 'Combat' },

    // --- JOBS & ECONOMY ---
    { cmd: '/daftarjob', prefix: '.daftarjob', desc: 'Melihat daftar pekerjaan yang tersedia.', category: 'Economy' },
    { cmd: '/craft', prefix: '.craft', desc: 'Membuka menu crafting item.', category: 'Economy' },
    { cmd: '/mine', prefix: '.mine', desc: 'Menambang ore (Butuh Pickaxe).', category: 'Economy' },
    { cmd: '/fish', prefix: '.fish', desc: 'Memancing ikan (Butuh Rod).', category: 'Economy' },
    { cmd: '/market', prefix: '.market', desc: 'Melihat pasar lelang global.', category: 'Economy' },
    { cmd: '/trade', prefix: '.trade', desc: 'Melakukan pertukaran item dengan pemain lain.', category: 'Economy' },

    // --- SOCIAL & GUILD ---
    { cmd: '/party', prefix: '.party', desc: 'Membuat atau mengelola party.', category: 'Social' },
    { cmd: '/guild create', prefix: '.gcreate', desc: 'Membuat Guild baru (Biaya: 5000G).', category: 'Social' },
    { cmd: '/guild invite', prefix: '.ginvite', desc: 'Mengundang member ke Guild.', category: 'Social' },
    { cmd: '/leaderboard', prefix: '.lb', desc: 'Melihat peringkat pemain teratas.', category: 'Social' },

    // --- SYSTEM & UTILITY ---
    { cmd: '/help', prefix: '.help', desc: 'Menampilkan daftar bantuan.', category: 'System' },
    { cmd: '/ping', prefix: '.ping', desc: 'Cek latensi bot.', category: 'System' },
    { cmd: '/report', prefix: '.report', desc: 'Melaporkan bug atau pemain.', category: 'System' },

    // --- ADMIN (Staff Only) ---
    { cmd: '/admin item', prefix: '.give', desc: 'Memberikan item ke player.', category: 'Admin' },
    { cmd: '/admin xp', prefix: '.setxp', desc: 'Mengatur XP player.', category: 'Admin' },
    { cmd: '/admin ban', prefix: '.ban', desc: 'Banned player dari sistem RPG.', category: 'Admin' }
];
