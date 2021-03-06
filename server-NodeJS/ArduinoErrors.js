//********************//
// Arduino Error list //
//********************//
// -> link arduino error codes to readable errors messages


// errors list possible from arduino
var list = 
[
    // global
    { "key": "100", "val": "json == null"},
    { "key": "101", "val": "id == null" },
    { "key": "102", "val": "action == null" },
    { "key": "103", "val": "parametres == null" },
    { "key": "104", "val": "action non reconnue" },

    // blink
    { "key": "201", "val": "pin == null" },
    { "key": "202", "val": "pin not [1,13]" },
    { "key": "203", "val": "duree == null" },
    { "key": "204", "val": "duree  not [100,2000]" },
    { "key": "205", "val": "nb == null" },
    { "key": "206", "val": "nb < 2" },

    // write
    { "key": "301", "val": "pin == null" },
    { "key": "302", "val": "val == null" },
    { "key": "303", "val": "mod == null" },
    { "key": "304", "val": "mod différent de 'a' ou 'b'" },
    { "key": "305", "val": "mod == a && (pin not [0,5]) OR mod == b && (pin not [1,13])" },
    { "key": "306", "val": "mod == b && (val not [0,1]) OR mod == a && (val not [0,255])" },

    // read
    { "key": "401", "val": "pin == null" },
    { "key": "402", "val": "mod == null" },
    { "key": "403", "val": "mod différent de 'a'ou 'b'" },
    { "key": "404", "val": "mod == a && (pin not [0,5]) OR mod == b && (pin not [1,13])" }
]

// exports
module.exports.list = list;
