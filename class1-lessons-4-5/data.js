/* Uloom Quest – Class 1, Lessons 4 & 5
   ALL content below is taken from the Jamiatul Ulama SA Tas-heel series (Class/Grade 1)
   and its Grade 1 Qur'an reader "Towards Reading the Qur'an Part 1". Page refs are book pages.
   Tokens: {T} = تعالى after Allaah, {S} = ﷺ, {A} = عليه السلام, {R} = رضي الله عنه
   Round types: letter, wordfind, mcq, tf, sort, order, match, car
*/
window.ULOOM_DATA = {
  title: "Uloom Quest",
  subtitle: "Class 1 · Lessons 4 & 5",
  subjects: {
    quran:   { name: "Qur'an",   icon: "📖", color: "#1f9d6b" },
    aqaaid:  { name: "Aqaa-id",  icon: "⭐", color: "#7b5cff" },
    fiqh:    { name: "Fiqh",     icon: "💧", color: "#1e88e5" },
    akhlaaq: { name: "Akhlaaq",  icon: "💚", color: "#e8590c" },
    hadeeth: { name: "Hadeeth",  icon: "📜", color: "#c2185b" },
    tareekh: { name: "Taa-reekh",icon: "⛵", color: "#00897b" }
  },
  // Letters taught before lesson 4 in TRQ Part 1 (used only as distractors)
  oldLetters: ["بَ","مَ","فَ","وَ","رَ","لَ","نَ"],
  levels: [
    {
      id: "l4", name: "Lesson 4", color: "#1f9d6b", emoji: "🌙",
      learned: [
        "New letters: جَ ja · شَ sha · يَ ya",
        "Allaah {T} is All-Hearing – اَلسَّمِيْعُ",
        "Keep urine and stool off your body and clothes",
        "Paradise lies under the feet of mothers",
        "Nooh {A} and the building of the ark"
      ],
      rounds: [
        { s:"quran", type:"intro", letters:[["جَ","ja"],["شَ","sha"],["يَ","ya"]], say:"Lesson 4 letters. Ja. Sha. Ya." },
        { s:"quran", type:"letter", target:["جَ","ja"], pool:["جَ","شَ","يَ","بَ","مَ","نَ"] },
        { s:"quran", type:"letter", target:["شَ","sha"], pool:["جَ","شَ","يَ","فَ","وَ","لَ"] },
        { s:"quran", type:"letter", target:["يَ","ya"], pool:["جَ","شَ","يَ","رَ","بَ","نَ"] },
        { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is All-Hearing. In Arabic, All-Hearing is…", ar:true, options:["اَلسَّمِيْعُ","اَلْوَدُوْدُ","اَلْبَصِيْرُ"], answer:0 },
        { s:"aqaaid", type:"tf", q:"Allaah {T} hears the silent movement of an ant.", answer:true },
        { s:"aqaaid", type:"tf", q:"Some sounds are too soft for Allaah {T} to hear.", answer:false, why:"No sound is too soft or too loud for Him." },
        { s:"aqaaid", type:"tf", q:"Allaah {T} hears, but needs no ears.", answer:true },
        { s:"aqaaid", type:"mcq", q:"At Badr, Nabee {S} lifted his hands and made dua. What did Allaah {T} send?", options:["Rain that made the ground hard and gave fresh water","A strong wind","Lots of camels"], answer:0 },
        { s:"aqaaid", type:"match", q:"Match the poem: Allaah knows · hears · sees", pairs:[["Allaah knows","اَللهُ عَلِيْمٌ"],["Allaah hears","اَللهُ سَمِيْعٌ"],["Allaah sees","اَللهُ بَصِيْرٌ"]] },
        { s:"quran", type:"wordfind", target:["شَ","sha"], words:["مَشَ","جَبَ","يَنَ","لَجَ"], answer:0 },
        { s:"quran", type:"wordfind", target:["جَ","ja"], words:["رَشَ","وَيَ","نَجَ","شَوَ"], answer:2 },
        { s:"fiqh", type:"mcq", q:"In the toilet, I take care that urine or stool does not dirty my…", options:["body and clothes","books","shoes on the shelf"], answer:0 },
        { s:"hadeeth", type:"match", q:"Hadeeth 4 – Mother. Match the Arabic to its meaning", pairs:[["اَلْجَنَّةُ","Paradise"],["تَحْتَ أَقْدَامِ","lies under the feet"],["الْأُمَّهَاتِ","of mothers"]] },
        { s:"hadeeth", type:"mcq", q:"اَلْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ – what does it mean?", options:["Paradise lies under the feet of mothers","Always be truthful","Eat with your right hand"], answer:0 },
        { s:"hadeeth", type:"tf", q:"If we obey and respect our mothers, we will enter Jannah.", answer:true },
        { s:"tareekh", type:"order", q:"Put the story of the ark in order", items:[
            "Allaah {T} accepted the du'a of Nooh {A} and told him to build an ark",
            "People laughed at Nooh {A} while they were building the ark",
            "A pair of every living creature was placed in the ship",
            "Allaah {T} brought about a great flood",
            "Only Nooh {A} and his people on the ship were saved" ] },
        { s:"tareekh", type:"mcq", q:"How many people who believed joined Nooh {A} on the ark?", options:["82","10","1000"], answer:0 },
        { s:"tareekh", type:"mcq", q:"Who refused to board the ark?", options:["His wife and son","The animals","His followers"], answer:0 },
        { s:"quran", type:"wordfind", target:["يَ","ya"], words:["جَمَ","شَلَ","يَلَ","فَشَ"], answer:2 }
      ]
    },
    {
      id: "l5", name: "Lesson 5", color: "#7b5cff", emoji: "⭐",
      learned: [
        "New letters: تَ ta · دَ da · طَ taw (heavy)",
        "Allaah {T} is All-Loving – اَلْوَدُوْدُ",
        "Use the left hand to clean yourself (istinjaa)",
        "Give and take with good manners",
        "Always be truthful – عَلَيْكُمْ بِالصِّدْقِ",
        "Ibraheem {A} only worshipped one Allaah"
      ],
      rounds: [
        { s:"quran", type:"intro", letters:[["تَ","ta"],["دَ","da"],["طَ","taw"]], say:"Lesson 5 letters. Ta. Da. Taw, the heavy one." },
        { s:"quran", type:"letter", target:["تَ","ta"], pool:["تَ","دَ","طَ","بَ","نَ","يَ"] },
        { s:"quran", type:"letter", target:["دَ","da"], pool:["تَ","دَ","طَ","رَ","جَ","لَ"] },
        { s:"quran", type:"letter", target:["طَ","taw"], pool:["تَ","دَ","طَ","شَ","مَ","فَ"] },
        { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is All-Loving. In Arabic, All-Loving is…", ar:true, options:["اَلسَّمِيْعُ","اَلْوَدُوْدُ","اَلْبَصِيْرُ"], answer:1 },
        { s:"aqaaid", type:"tf", q:"Allaah {T} loves us more than a mother loves her little baby.", answer:true },
        { s:"aqaaid", type:"tf", q:"Allaah {T} loves only the rich.", answer:false, why:"Allaah loves the poor and the rich." },
        { s:"aqaaid", type:"tf", q:"Allaah {T} loves people of all colours.", answer:true },
        { s:"aqaaid", type:"mcq", q:"A man took two young pigeons from their nest. What did Nabee {S} tell him?", options:["Go at once and put them back in their nest","Keep them in your wrapper","Give them away"], answer:0 },
        { s:"quran", type:"wordfind", target:["دَ","da"], words:["بَدَ","تَمَ","طَبَ","نَتَ"], answer:0 },
        { s:"quran", type:"wordfind", target:["طَ","taw"], words:["لَتَ","نَدَ","مَطَرَ","جَتَ"], answer:2 },
        { s:"fiqh", type:"mcq", q:"Which hand do we use when cleaning ourselves (istinjaa)?", options:["Left hand","Right hand"], answer:0 },
        { s:"akhlaaq", type:"sort", q:"Give and Take: good or bad?", items:[
            ["I pass things with my right hand", true],
            ["Throwing things at people", false],
            ["I give to the needy with a smile", true],
            ["Grabbing when taking something", false],
            ["Saying 'please' when asking and 'jazaakallaah' when I receive something", true],
            ["Showing an angry face when giving to the needy", false] ] },
        { s:"akhlaaq", type:"mcq", q:"The people of Madeenah shared everything with the Muslims of Makkah. What did they want in return?", options:["For Allaah to reward them in Jannah","Money back","Gifts and presents"], answer:0 },
        { s:"hadeeth", type:"mcq", q:"عَلَيْكُمْ بِالصِّدْقِ – what does it mean?", options:["(Always) be truthful","Paradise lies under the feet of mothers","None of you should stand and drink"], answer:0 },
        { s:"hadeeth", type:"car", q:"Be truthful! Is this car black?", color:"#2b2b2b", answer:true },
        { s:"hadeeth", type:"car", q:"Be truthful! Is this car black?", color:"#ffffff", answer:false },
        { s:"hadeeth", type:"tf", q:"One lie always leads to another lie.", answer:true },
        { s:"tareekh", type:"mcq", q:"What was the name of Ibraheem {A}'s father?", options:["Aazar","Namrood","Nooh"], answer:0 },
        { s:"tareekh", type:"order", q:"Put the story of Ibraheem {A} in order", items:[
            "Ibraheem {A} broke all the idols in the temple",
            "He was brought before Namrood, the king",
            "The king threw Ibraheem {A} into a huge fire",
            "Allaah {T} ordered the fire to become cool and safe" ] },
        { s:"tareekh", type:"tf", q:"Ibraheem {A} only worshipped one Allaah.", answer:true }
      ]
    },
    { id:"mix", name:"Mixed Review", color:"#e8590c", emoji:"🌟", mixed:true, count:16,
      learned:["You revised all of Lessons 4 and 5. MashaAllah!"] }
  ],
  // Extra book-based items used only in Mixed Review
  mixedExtra: [
    { s:"quran", type:"letter", target:["طَ","taw"], pool:["جَ","شَ","يَ","تَ","دَ","طَ"] },
    { s:"quran", type:"letter", target:["شَ","sha"], pool:["جَ","شَ","يَ","تَ","دَ","طَ"] },
    { s:"quran", type:"letter", target:["تَ","ta"], pool:["جَ","شَ","يَ","تَ","دَ","طَ"] },
    { s:"quran", type:"letter", target:["يَ","ya"], pool:["جَ","شَ","يَ","تَ","دَ","طَ"] },
    { s:"quran", type:"match", q:"Match each letter to its sound", pairs:[["جَ","ja"],["شَ","sha"],["يَ","ya"],["تَ","ta"],["دَ","da"],["طَ","taw"]] },
    { s:"aqaaid", type:"tf", q:"Allaah {T} hears when we swear or lie.", answer:true },
    { s:"aqaaid", type:"tf", q:"Allaah {T} loves those who seek forgiveness when they do wrong.", answer:true },
    { s:"akhlaaq", type:"sort", q:"Good or bad?", items:[
        ["Zaynub took a sweet with her right hand and said 'jazaakallaah'", true],
        ["Ahmad grabbed the toy from his younger brother and refused to share", false],
        ["I take things with my right hand", true],
        ["Ismaaeel threw an apple at a hungry person", false] ] },
    { s:"tareekh", type:"mcq", q:"Allaah {T} ordered the fire to become…", options:["cool and safe","bigger","hotter"], answer:0 },
    { s:"tareekh", type:"mcq", q:"What did Aazar make and sell?", options:["Idols","Bread","Ships"], answer:0 }
  ]
};
