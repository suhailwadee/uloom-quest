/* Uloom Quest – Class 1 (complete). ALL content is taken from the Jamiatul Ulama SA Tas-heel series, Class/Grade 1
   (Aqaa-id, Fiqh, Akhlaaq, Ahaadeeth, Taa-reekh) and the Lenasia Muslim Association reader "Towards Reading the Qur'an Part 1" (TRQ).
   src: book page numbers (printed page numbers, not PDF page numbers).
   Tokens: {T} تعالى · {S} ﷺ · {A} عليه السلام · {R} رضي الله عنه · {H} رضي الله عنها · {M} رحمة الله عليه
   Round types: intro, letter, wordfind, listen, mcq, tf, sort, order, match, car.  trq:{...} specs are expanded by levels.js */
window.ULOOM_DATA = {
  title: "Uloom Quest",
  subtitle: "Class 1 · All lessons",
  subjects: {
    quran:   { name: "Qur'an",   icon: "📖", color: "#1f9d6b" },
    aqaaid:  { name: "Aqaa-id",  icon: "⭐", color: "#7b5cff" },
    fiqh:    { name: "Fiqh",     icon: "💧", color: "#1e88e5" },
    akhlaaq: { name: "Akhlaaq",  icon: "💚", color: "#e8590c" },
    hadeeth: { name: "Hadeeth",  icon: "📜", color: "#c2185b" },
    tareekh: { name: "Taa-reekh",icon: "⛵", color: "#00897b" }
  },
  books: {
    quran: "Towards Reading the Qur'an Part 1 (Lenasia Muslim Association)",
    aqaaid: "Tas-heelul Aqaa-id 1", fiqh: "Tas-heelul Fiqh 1", akhlaaq: "Tas-heelul Akhlaaq 1",
    hadeeth: "Tas-heelul Ahaadeeth 1", tareekh: "Tas-heelut Taa-reekh 1"
  },
  /* Class 1 books, each its own section. title = exact title on the source PDF cover. say = spoken book name (Emma). */
  bookList: [
    { id: "quran",   short: "Qur'an Reader", title: "Towards Reading the Qur'an Part 1", publisher: "Lenasia Muslim Association", say: "Towards Reading the Qur'an.", icon: "📖", color: "#1f9d6b", minRounds: 0,
      reviews: [[1,3],[4,6],[7,9],[10,11],[12,16],[17,21],[22,26],[27,31],[32,36],[37,41]],
      parts: [["Letters and their names", 1, 11], ["More letters", 12, 22], ["Kasrah and dhammah", 23, 31], ["Sukoon, tanween and shaddah", 32, 41]] },
    { id: "aqaaid",  short: "Aqaa-id",   title: "Tas-heelul Aqaa-id 1",   publisher: "Jamiatul Ulama SA", say: "Tas-heelul Aqaa-id.", icon: "⭐", color: "#7b5cff", minRounds: 4, reviews: [[1,4],[5,7]] },
    { id: "fiqh",    short: "Fiqh",      title: "Tas-heelul Fiqh 1",      publisher: "Jamiatul Ulama SA", say: "Tas-heelul Fiqh.", icon: "💧", color: "#1e88e5", minRounds: 3,
      reviews: [[1,10],[11,16],[17,24],[25,31]],
      parts: [["Istinjaa", 1, 10], ["Keeping my body clean", 11, 16], ["Clean habits", 17, 24], ["Clean surroundings", 25, 31]] },
    { id: "akhlaaq", short: "Akhlaaq",   title: "Tas-heelul Akhlaaq 1",   publisher: "Jamiatul Ulama SA", say: "Tas-heelul Akhlaaq.", icon: "💚", color: "#e8590c", minRounds: 3, reviews: [[1,3],[5,7]],
      note: "Lesson 4 (My speech) is missing from the PDF." },
    { id: "hadeeth", short: "Ahaadeeth", title: "Tas-heelul Ahaadeeth 1", publisher: "Jamiatul Ulama SA", say: "Tas-heelul Ahaadeeth.", icon: "📜", color: "#c2185b", minRounds: 3, reviews: [[1,5],[6,10]] },
    { id: "tareekh", short: "Taa-reekh", title: "Tas-heelut Taa-reekh 1", publisher: "Jamiatul Ulama SA", say: "Tas-heelut Taa-reekh.", icon: "⛵", color: "#00897b", minRounds: 3, reviews: [[1,6],[7,11]] }
  ],
  units: [
    { name: "Unit 1 · Lessons 1–11", from: 1, to: 11, note: "All six books" },
    { name: "Unit 2 · Lessons 12–21", from: 12, to: 21, note: "Qur'an reader + Fiqh" },
    { name: "Unit 3 · Lessons 22–31", from: 22, to: 31, note: "Qur'an reader + Fiqh" },
    { name: "Unit 4 · Lessons 32–41", from: 32, to: 41, note: "Qur'an reader" }
  ],
  reviews: [
    { id: "r1", name: "Review 1–3",   from: 1,  to: 3 },
    { id: "r2", name: "Review 4–6",   from: 4,  to: 6 },
    { id: "r3", name: "Review 7–9",   from: 7,  to: 9 },
    { id: "r4", name: "Review 10–11", from: 10, to: 11 },
    { id: "r5", name: "Review 12–16", from: 12, to: 16 },
    { id: "r6", name: "Review 17–21", from: 17, to: 21 },
    { id: "r7", name: "Review 22–26", from: 22, to: 26 },
    { id: "r8", name: "Review 27–31", from: 27, to: 31 },
    { id: "r9", name: "Review 32–36", from: 32, to: 36 },
    { id: "r10", name: "Review 37–41", from: 37, to: 41 }
  ],
  lessons: []
};
(function (L) {
/* ---------------- Unit 1 ---------------- */
L.push({ n: 1, src: { quran: "L1 p9–10", aqaaid: "L1 p6–9", fiqh: "L1 p6–7", akhlaaq: "L1 p6–7", hadeeth: "H1 p6", tareekh: "L1 p6–7" },
  learned: ["The names of the Arabic letters", "Allaah {T} is One", "Read the du'a before entering the toilet", "Good manners in my classroom", "Make salaam first", "Aadam {A}, the first man"],
  trq: { kind: "names", items: [["ا","أَلِف"],["ب","بَاء"],["ت","تَاء"],["ث","ثَاء"],["ج","جِيْم"],["ح","حَاء"],["خ","خَاء"],["د","دَال"],["ذ","ذَال"],["ر","رَاء"],["ز","زَاء"],["س","سِيْن"],["ش","شِيْن"],["ص","صَاد"]] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is…", options:["One","Two","Many"], answer:0 },
    { s:"aqaaid", type:"tf", q:"Allaah {T} has no children and no parents.", answer:true },
    { s:"aqaaid", type:"tf", q:"Allaah {T} needs food and drink.", answer:false, why:"Allaah is not in need of food or drink." },
    { s:"aqaaid", type:"mcq", q:"Umayyah hurt Bilal {R} on the burning sand. What did Bilal keep saying?", options:["Allaah is One! Allaah is One!","Nothing at all","Let me go home"], answer:0 },
    { s:"aqaaid", type:"mcq", q:"Who bought Bilal {R} and set him free?", options:["Aboo Bakr {R}","Umayyah","Umar {R}"], answer:0 },
    { s:"fiqh", type:"mcq", q:"What do we read before entering the toilet?", options:["The du'a for entering the toilet","Nothing","A story book"], answer:0 },
    { s:"akhlaaq", type:"sort", q:"My classroom: good or bad?", items:[
      ["I make salaam when I enter the classroom", true], ["I talk and play while the teacher explains", false],
      ["I do my work neatly", true], ["I eat in the classroom", false],
      ["I speak to my teacher with respect", true], ["I leave the classroom without permission", false] ] },
    { s:"akhlaaq", type:"mcq", q:"Husayn had bad manners in class, and he was sent out. Bad manners always lead to…", options:["trouble","prizes","more friends"], answer:0 },
    { s:"hadeeth", type:"mcq", q:"إِنَّ أَوْلَى النَّاسِ بِاللّٰهِ تَعَالٰى مَنْ بَدَأَهُمْ بِالسَّلَامِ – what does it mean?", options:["Indeed the nearest to Allaah are those who make salaam first","Every good deed is charity","Allaah is beautiful and He loves beauty"], answer:0 },
    { s:"hadeeth", type:"tf", q:"We should wait for others to greet us first.", answer:false, why:"Always try to be the first to greet." },
    { s:"tareekh", type:"mcq", q:"Who was the first man created by Allaah {T}?", options:["Aadam {A}","Nooh {A}","Ibraaheem {A}"], answer:0 },
    { s:"tareekh", type:"mcq", q:"Allaah {T} created Aadam {A} from…", options:["clay","gold","stone"], answer:0 },
    { s:"tareekh", type:"tf", q:"Shaytaan did not obey Allaah {T}. He refused to make sajdah to Aadam {A}.", answer:true },
    { s:"tareekh", type:"mcq", q:"Who was the wife of Aadam {A}?", options:["Hawwaa {H}","Aaminah","Haajirah {H}"], answer:0 }
  ] });

L.push({ n: 2, src: { quran: "L2 p11–12", aqaaid: "L2 p12–15", fiqh: "L2 p8", akhlaaq: "L2 p8–9", hadeeth: "H2 p7", tareekh: "L2 p10–11" },
  learned: ["New letters: وَ wa · فَ fa · مَ ma · بَ ba", "Allaah {T} is All-Knowing – اَلْعَلِيْمُ", "Enter the toilet with the left foot", "Good manners at home", "Say Bismillaah and eat with your right hand", "Aadam {A} on earth"],
  trq: { kind: "letters", letters: [["وَ","wa"],["فَ","fa"],["مَ","ma"],["بَ","ba"]], words: ["وَبَ","فَمَ","مَوَ","بَفَ","فَوَمَ","مَوَبَ"] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is All-Knowing. In Arabic, All-Knowing is…", ar:true, options:["اَلْعَلِيْمُ","اَلسَّمِيْعُ","اَلْبَصِيْرُ"], answer:0 },
    { s:"aqaaid", type:"tf", q:"Allaah {T} knows the number of fish in the sea.", answer:true },
    { s:"aqaaid", type:"tf", q:"Allaah {T} knows what we think.", answer:true },
    { s:"aqaaid", type:"mcq", q:"The mother wanted to mix water with the milk. What did her daughter say?", options:["How can we hide from Allaah? He sees everything and knows all.","Let us sell it quickly","Let us drink it"], answer:0 },
    { s:"fiqh", type:"mcq", q:"Which foot do we use to enter the toilet?", options:["Left foot","Right foot"], answer:0 },
    { s:"akhlaaq", type:"sort", q:"My home: good or bad?", items:[
      ["I knock on the door and make salaam when I enter my home", true], ["I leave my clothes and shoes lying around", false],
      ["I keep my room tidy", true], ["I scream and nag when I want something", false],
      ["I always return home before sunset", true], ["I go out to play without asking my parents", false] ] },
    { s:"akhlaaq", type:"mcq", q:"Humairah heard her mother making du'a for her. What did she understand?", options:["How important it is for children to obey and help their parents","That she should stay up late","That she should hide her toys"], answer:0 },
    { s:"hadeeth", type:"mcq", q:"سَمِّ اللّٰهَ وَكُلْ بِيَمِيْنِكَ – what does it mean?", options:["Take the name of Allaah and eat with your right hand","None of you should stand and drink","Paradise lies under the feet of mothers"], answer:0 },
    { s:"hadeeth", type:"tf", q:"Shaytaan shares the food of those who eat without taking the name of Allaah.", answer:true },
    { s:"tareekh", type:"order", q:"Put the story of Aadam {A} in order", items:[
      "Allaah {T} told them they could eat from all the trees of jannah except one",
      "Shaytaan tricked them into eating from the tree",
      "They begged for Allaah's forgiveness",
      "Allaah {T} forgave them and sent them to stay on earth" ] },
    { s:"tareekh", type:"mcq", q:"Aadam {A} was the first man and the first … of Allaah.", options:["Nabee","king","farmer"], answer:0 }
  ] });

L.push({ n: 3, src: { quran: "L3 p13–14", aqaaid: "L3 p18–21", fiqh: "L3 p9", akhlaaq: "L3 p10–11", hadeeth: "H3 p8", tareekh: "L3 p14–15" },
  learned: ["New letters: رَ ra · لَ la · نَ na", "Allaah {T} is All-Seeing – اَلْبَصِيْرُ", "Always sit and urinate", "A good Muslim", "Do not stand and drink", "Nooh {A} invited his people"],
  trq: { kind: "letters", letters: [["رَ","ra"],["لَ","la"],["نَ","na"]], words: ["وَرَ","بَرَ","مَلَ","لَفَ","مَنَ","نَفَلَ"] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is All-Seeing. In Arabic, All-Seeing is…", ar:true, options:["اَلْبَصِيْرُ","اَلْعَلِيْمُ","اَلْوَدُوْدُ"], answer:0 },
    { s:"aqaaid", type:"tf", q:"Allaah {T} sees an ant walking in the darkness of the night.", answer:true },
    { s:"aqaaid", type:"tf", q:"We can hide from Allaah {T}.", answer:false, why:"We cannot hide from Allaah. He sees everything we do." },
    { s:"aqaaid", type:"mcq", q:"The favourite follower of Junayd {M} did not slaughter his chicken. Why?", options:["No matter where he went, Allaah could still see him","He was too tired","He lost his knife"], answer:0 },
    { s:"fiqh", type:"mcq", q:"How should we pass urine?", options:["Always sit","Stand up"], answer:0 },
    { s:"akhlaaq", type:"sort", q:"A good Muslim: good or bad?", items:[
      ["A good Muslim is always first to make salaam", true], ["Laughing at other people", false],
      ["A good Muslim gives his seat to elders", true], ["Fighting and swearing", false],
      ["A good Muslim always smiles", true], ["Arguing with elders", false] ] },
    { s:"akhlaaq", type:"mcq", q:"Why did Peter become a Muslim and change his name to Abdullaah?", options:["He saw the good manners of the Muslim children","They gave him toys","He liked their car"], answer:0, why:"Your manners tell people about your religion." },
    { s:"hadeeth", type:"mcq", q:"لَا يَشْرَبَنَّ أَحَدٌ مِّنْكُمْ قَائِمًا – what does it mean?", options:["None of you should stand and drink","Take the name of Allaah and eat with your right hand","Always be truthful"], answer:0 },
    { s:"hadeeth", type:"tf", q:"Animals stand while eating and drinking. We sit.", answer:true },
    { s:"tareekh", type:"mcq", q:"For how many years did Nooh {A} invite his people to the worship of Allaah?", options:["950","10","50"], answer:0 },
    { s:"tareekh", type:"tf", q:"The people of Nooh {A} worshipped idols.", answer:true },
    { s:"tareekh", type:"tf", q:"The humble people obeyed the teachings of Nooh {A}.", answer:true }
  ] });
})(window.ULOOM_DATA.lessons);
(function (L) {
L.push({ n: 4, src: { quran: "L4 p15–16", aqaaid: "L4 p24–27", fiqh: "L4 p10", akhlaaq: "L4 p12 (missing from PDF)", hadeeth: "H4 p9", tareekh: "L4 p18–19" },
  learned: ["New letters: جَ ja · شَ sha · يَ ya", "Allaah {T} is All-Hearing – اَلسَّمِيْعُ", "Keep urine and stool off your body and clothes", "Paradise lies under the feet of mothers", "Nooh {A} and the building of the ark"],
  trq: { kind: "letters", letters: [["جَ","ja"],["شَ","sha"],["يَ","ya"]], words: ["مَشَ","جَبَ","يَنَ","لَجَ","رَشَ","نَجَ","شَوَ","يَلَ"] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is All-Hearing. In Arabic, All-Hearing is…", ar:true, options:["اَلسَّمِيْعُ","اَلْوَدُوْدُ","اَلْبَصِيْرُ"], answer:0 },
    { s:"aqaaid", type:"tf", q:"Allaah {T} hears the silent movement of an ant.", answer:true },
    { s:"aqaaid", type:"tf", q:"Some sounds are too soft for Allaah {T} to hear.", answer:false, why:"No sound is too soft or too loud for Him." },
    { s:"aqaaid", type:"tf", q:"Allaah {T} hears, but needs no ears.", answer:true },
    { s:"aqaaid", type:"mcq", q:"At Badr, Nabee {S} lifted his hands and made dua. What did Allaah {T} send?", options:["Rain that made the ground hard and gave fresh water","A strong wind","Lots of camels"], answer:0 },
    { s:"aqaaid", type:"match", q:"Match the poem: Allaah knows · hears · sees", pairs:[["Allaah knows","اَللهُ عَلِيْمٌ"],["Allaah hears","اَللهُ سَمِيْعٌ"],["Allaah sees","اَللهُ بَصِيْرٌ"]] },
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
    { s:"tareekh", type:"mcq", q:"Who refused to board the ark?", options:["His wife and son","The animals","His followers"], answer:0 }
  ] });

L.push({ n: 5, src: { quran: "L5 p17–18", aqaaid: "L5 p30–33", fiqh: "L5 p11", akhlaaq: "L5 p14–15", hadeeth: "H5 p10", tareekh: "L5 p22–23" },
  learned: ["New letters: تَ ta · دَ da · طَ taw (heavy)", "Allaah {T} is All-Loving – اَلْوَدُوْدُ", "Use the left hand to clean yourself (istinjaa)", "Give and take with good manners", "Always be truthful – عَلَيْكُمْ بِالصِّدْقِ", "Ibraheem {A} only worshipped one Allaah"],
  trq: { kind: "letters", letters: [["تَ","ta"],["دَ","da"],["طَ","taw"]], words: ["بَدَ","تَمَ","طَبَ","نَتَ","مَطَرَ","لَتَ","نَدَ","جَتَ"] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is All-Loving. In Arabic, All-Loving is…", ar:true, options:["اَلسَّمِيْعُ","اَلْوَدُوْدُ","اَلْبَصِيْرُ"], answer:1 },
    { s:"aqaaid", type:"tf", q:"Allaah {T} loves us more than a mother loves her little baby.", answer:true },
    { s:"aqaaid", type:"tf", q:"Allaah {T} loves only the rich.", answer:false, why:"Allaah loves the poor and the rich." },
    { s:"aqaaid", type:"tf", q:"Allaah {T} loves people of all colours.", answer:true },
    { s:"aqaaid", type:"mcq", q:"A man took two young pigeons from their nest. What did Nabee {S} tell him?", options:["Go at once and put them back in their nest","Keep them in your wrapper","Give them away"], answer:0 },
    { s:"fiqh", type:"mcq", q:"Which hand do we use when cleaning ourselves (istinjaa)?", options:["Left hand","Right hand"], answer:0 },
    { s:"akhlaaq", type:"sort", q:"Give and Take: good or bad?", items:[
        ["I pass things with my right hand", true], ["Throwing things at people", false],
        ["I give to the needy with a smile", true], ["Grabbing when taking something", false],
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
  ] });

L.push({ n: 6, src: { quran: "L6 p19", aqaaid: "L6 p36–39", fiqh: "L6 p12", akhlaaq: "L6 p16–17", hadeeth: "H6 p11", tareekh: "L6 p26–27" },
  learned: ["New letter: ة round taa (ta)", "Allaah {T} is Most Merciful – اَلرَّحِيْمُ", "Clean yourself with water, mud pieces or toilet paper", "Good eating habits", "Allaah is beautiful and He loves beauty", "The sacrifice of Ibraaheem {A}"],
  trq: { kind: "letters", letters: [["ةَ","ta"]], words: ["لَةَ","يَةَ","نَةَ","دَةَ","شَجَرَةَ","مَتَ","وَلَتَ"] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Muslims believe that Allaah {T} is Most Merciful. In Arabic, Most Merciful is…", ar:true, options:["اَلرَّحِيْمُ","اَلْعَلِيْمُ","اَلسَّمِيْعُ"], answer:0 },
    { s:"aqaaid", type:"tf", q:"Allaah {T} is more merciful to us than a mother is to her child.", answer:true },
    { s:"aqaaid", type:"tf", q:"Allaah {T} gave us the day to work and the night to rest.", answer:true },
    { s:"aqaaid", type:"mcq", q:"A robber saw a bird putting dates into the mouth of a blind snake. What did he do?", options:["He broke his sword and begged Allaah to forgive him","He took the dates for himself","He went to sleep"], answer:0 },
    { s:"fiqh", type:"mcq", q:"How do we clean ourselves in the toilet?", options:["With water, mud pieces or toilet paper","With our clothes","We do not clean ourselves"], answer:0 },
    { s:"akhlaaq", type:"sort", q:"Eating habits: good or bad?", items:[
      ["I wash my hands before I eat", true], ["Eating while standing or walking", false],
      ["I say 'bismillaah' before eating", true], ["Taking more food than I can eat", false],
      ["I eat with my right hand", true], ["Complaining about the food", false] ] },
    { s:"akhlaaq", type:"tf", q:"A family fed the hungry guest of Nabee {S} while they stayed hungry. Allaah {T} was very pleased with them.", answer:true },
    { s:"hadeeth", type:"mcq", q:"إِنَّ اللّٰهَ جَمِيْلٌ يُحِبُّ الْجَمَالَ – what does it mean?", options:["Allaah is beautiful and He loves beauty","Be kind to your neighbour","Every good deed is charity"], answer:0 },
    { s:"hadeeth", type:"tf", q:"Allaah {T} loves those who are clean and neat.", answer:true },
    { s:"tareekh", type:"mcq", q:"How old was Ibraaheem {A} when his son Ismaaeel {A} was born?", options:["86","10","20"], answer:0 },
    { s:"tareekh", type:"mcq", q:"Where did Ibraaheem {A} leave Ismaaeel {A} and his mother Haajirah {H}?", options:["In the valley of Makkah","In Egypt","On a ship"], answer:0 },
    { s:"tareekh", type:"tf", q:"Allaah {T} saved Ismaaeel {A} and sent a ram to be slaughtered in his place.", answer:true },
    { s:"tareekh", type:"mcq", q:"Ibraaheem {A} and Ismaaeel {A} later built the…", options:["Ka'bah in Makkah","ark","palace of the king"], answer:0 }
  ] });

L.push({ n: 7, src: { quran: "L7 p20–22", aqaaid: "L7 p42–45", fiqh: "L7 p13", akhlaaq: "L7 p18–20", hadeeth: "H7 p12", tareekh: "L7 p30–31" },
  learned: ["New letters: كَ ka · ضَ dhwa · قَ qwa", "Nabee Muhammad {S} is the final messenger", "Leave the toilet with the right foot", "Good drinking habits", "The best of you have the most beautiful character", "Yoosuf {A}"],
  trq: { kind: "letters", letters: [["كَ","ka"],["ضَ","dhwa"],["قَ","qwa"]], words: ["لَكَ","شَكَرَ","رَضَ","فَضَلَ","بَقَرَ","قَلَ"] },
  rounds: [
    { s:"aqaaid", type:"mcq", q:"Who is the last messenger of Allaah {T}?", options:["Nabee Muhammad {S}","Nooh {A}","Aadam {A}"], answer:0 },
    { s:"aqaaid", type:"tf", q:"Nabee Muhammad {S} was sent as a prophet to all the people of the world.", answer:true },
    { s:"aqaaid", type:"mcq", q:"Where did Nabee {S} often go to sit alone and remember Allaah?", options:["The cave of Heera","The market","The sea"], answer:0 },
    { s:"aqaaid", type:"tf", q:"We love Nabee Muhammad {S} more than everyone in the world.", answer:true },
    { s:"fiqh", type:"mcq", q:"Which foot do we use to leave the toilet?", options:["Right foot","Left foot"], answer:0 },
    { s:"akhlaaq", type:"sort", q:"Drinking habits: good or bad?", items:[
      ["I sit and drink", true], ["Gulping it all down at once", false],
      ["I say 'alhamdulillaah' after drinking", true], ["Drinking from a cracked glass", false],
      ["I look into the glass before drinking", true], ["Wasting water", false] ] },
    { s:"akhlaaq", type:"mcq", q:"Many guests drank from one container of milk that Nabee {S} shared. What happened?", options:["The milk did not finish – there was enough for everyone","It spilled on the floor","Only one person drank"], answer:0 },
    { s:"akhlaaq", type:"match", q:"Match the poem", pairs:[["My food I eat saying","Bismillaah"],["My water I drink saying","Alhamdulillaah"],["My things I take saying","Jazakallaah"]] },
    { s:"hadeeth", type:"mcq", q:"إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلَاقًا – what does it mean?", options:["The best of you are those with the most beautiful character","None of you should stand and drink","Love for others what you love for yourself"], answer:0 },
    { s:"hadeeth", type:"tf", q:"Beautiful character means showing mercy to the young and respect to the elders.", answer:true },
    { s:"tareekh", type:"mcq", q:"How many sons did Yaaqoob {A} have?", options:["Twelve","Two","Five"], answer:0 },
    { s:"tareekh", type:"mcq", q:"Why were the brothers of Yoosuf {A} jealous of him?", options:["Because Yaaqoob {A} loved him very much","Because he was tall","Because he had a horse"], answer:0 },
    { s:"tareekh", type:"mcq", q:"What did his jealous brothers do?", options:["They threw him into a well","They gave him a gift","They took him to school"], answer:0 }
  ] });
})(window.ULOOM_DATA.lessons);
(function (L) {
L.push({ n: 8, src: { quran: "L8 p23–24", fiqh: "L8 p14", hadeeth: "H8 p13", tareekh: "L8 p34–35" },
  learned: ["Revision words from the Qur'an", "Read the du'a after leaving the toilet", "Be kind to your neighbour", "Yoosuf {A} in Egypt"],
  trq: { kind: "review", words: ["قَدَ","كَتَبَ","ضَرَبَ","دَرَجَ","فَجَرَ","بَقَرَ","جَبَ","كَفَ"] },
  rounds: [
    { s:"fiqh", type:"mcq", q:"What do we do when leaving the toilet?", options:["Read the du'a after leaving the toilet","Nothing at all"], answer:0 },
    { s:"hadeeth", type:"mcq", q:"أَحْسِنْ إِلٰى جَارِكَ تَكُنْ مُؤْمِنًا – what does it mean?", options:["Be kind to your neighbour – you shall be a (true) believer","Every good deed is charity","Always be truthful"], answer:0 },
    { s:"hadeeth", type:"sort", q:"A true believer and his neighbours: good or bad?", items:[
      ["He visits them when they are sick", true], ["He hurts their feelings", false], ["He feeds them when they are hungry", true], ["He harms them", false] ] },
    { s:"tareekh", type:"mcq", q:"Yoosuf {A} was well known for giving the meaning of…", options:["dreams","maps","numbers"], answer:0 },
    { s:"tareekh", type:"mcq", q:"The king freed Yoosuf {A} from jail and made him a…", options:["minister","farmer","sailor"], answer:0 },
    { s:"tareekh", type:"tf", q:"When there was no food in Egypt, Yoosuf {A} treated his brothers kindly and forgave them.", answer:true }
  ] });

L.push({ n: 9, src: { quran: "L9 p25–26", fiqh: "L9 poem p15", hadeeth: "H9 p14", tareekh: "L9 p38–39" },
  learned: ["New letters: اَ a · حَ ha (sharp)", "The Istinjaa poem: Eight things", "Love for others what you love for yourself", "The birth of Nabee Muhammad {S}"],
  trq: { kind: "letters", letters: [["اَ","a"],["حَ","ha"]], words: ["اَدَ","اَجَ","لَحَ","حَجَ","حَدَ","اَحَدَ"] },
  rounds: [
    { s:"fiqh", type:"match", q:"The Istinjaa poem. Match each part", pairs:[["Before entering","We seek the protection of Allaah"],["Stepping in","Left foot"],["Cleaning","We use the left hand"],["Leaving","We step with the right foot"]] },
    { s:"hadeeth", type:"mcq", q:"أَحِبَّ لِلنَّاسِ مَا تُحِبُّ لِنَفْسِكَ تَكُنْ مُسْلِمًا – what does it mean?", options:["Love for others what you love for yourself – you shall be a (true) Muslim","Be kind to your neighbour","Allaah is beautiful and He loves beauty"], answer:0 },
    { s:"hadeeth", type:"tf", q:"Muslims are selfish people.", answer:false, why:"Muslims are not selfish. We share our things with our brothers and sisters." },
    { s:"tareekh", type:"mcq", q:"Where was Nabee Muhammad {S} born?", options:["Makkah","Madeenah","Egypt"], answer:0 },
    { s:"tareekh", type:"mcq", q:"Who was the mother of Nabee {S}?", options:["Aaminah","Haleemah","Hawwaa {H}"], answer:0 },
    { s:"tareekh", type:"mcq", q:"Who cared for Nabee {S} in the countryside for four years?", options:["Haleemah Saadia {H}","Aaminah","Haajirah {H}"], answer:0 },
    { s:"tareekh", type:"tf", q:"The father of Nabee {S}, Abdullaah, had passed away before he was born.", answer:true }
  ] });

L.push({ n: 10, src: { quran: "L10 p27", fiqh: "L10 p16", hadeeth: "H10 p15, story p16–17", tareekh: "L10 p42–43" },
  learned: ["New letter: عَ 'a", "What istinjaa means", "Every good deed is charity", "The childhood of Nabee Muhammad {S}"],
  trq: { kind: "letters", letters: [["عَ","'a"]], words: ["عَطَ","فَعَلَ","قَعَدَ","جَعَلَ","وَعَدَ","مَعَكَ"] },
  rounds: [
    { s:"fiqh", type:"mcq", q:"What does istinjaa mean?", options:["To clean oneself after passing urine or stool","To eat with the right hand","To make salaam"], answer:0 },
    { s:"hadeeth", type:"mcq", q:"كُلُّ مَعْرُوْفٍ صَدَقَةٌ – what does it mean?", options:["Every good deed is charity","Paradise lies under the feet of mothers","None of you should stand and drink"], answer:0 },
    { s:"hadeeth", type:"tf", q:"A smile is charity.", answer:true },
    { s:"hadeeth", type:"tf", q:"Caring for animals is charity.", answer:true },
    { s:"hadeeth", type:"sort", q:"When Zayd came home: good or bad?", items:[
      ["Zayd ate his cake with his left hand", false], ["Zayd drank his juice standing", false],
      ["Zayd told his mother a lie", false], ["Eat with the right hand, as the hadeeth teaches", true],
      ["Sit and drink, as the hadeeth teaches", true], ["Be kind to the poor and to neighbours", true] ] },
    { s:"tareekh", type:"mcq", q:"Who took care of Nabee {S} after his mother Aaminah passed away?", options:["His grandfather Abdul Muttalib","Aboo Bakr {R}","Umar {R}"], answer:0 },
    { s:"tareekh", type:"tf", q:"As a child, Nabee {S} never spoke lies or used bad language.", answer:true },
    { s:"tareekh", type:"mcq", q:"What did Nabee {S} look after when he was young?", options:["Sheep","Horses","Ships"], answer:0 }
  ] });

L.push({ n: 11, src: { quran: "L11 p28", fiqh: "L11 p18", tareekh: "L11 p46–47" },
  learned: ["Review of the letters", "Keep your body clean with soap and water", "The character of Nabee Muhammad {S} – Al-Ameen"],
  trq: { kind: "review", words: ["بَ","نَ","تَ","يَ","جَ","حَ","كَ","قَ","عَ","اَ","طَ","ضَ"] },
  rounds: [
    { s:"fiqh", type:"mcq", q:"What do we use to clean ourselves?", options:["Soap and water","Only a towel","Nothing"], answer:0 },
    { s:"fiqh", type:"tf", q:"Allaah {T} loves those who are clean.", answer:true },
    { s:"tareekh", type:"mcq", q:"The people of Makkah called Nabee {S} Al-Ameen. What does it mean?", options:["The one who is trusted","The king","The traveller"], answer:0 },
    { s:"tareekh", type:"tf", q:"From a very young age, Nabee {S} showed special kindness to everyone, even animals.", answer:true },
    { s:"tareekh", type:"mcq", q:"Why did people leave their goods with Nabee {S} for safekeeping?", options:["Because of his honesty","Because he had a big house","Because he was a king"], answer:0 }
  ] });
})(window.ULOOM_DATA.lessons);
(function (L) {
const T = (n, quran, trq, learned, fiqhSrc, rounds) => L.push({ n, src: Object.assign({ quran }, fiqhSrc ? { fiqh: fiqhSrc } : {}), learned, trq, rounds: rounds || [] });
/* ---------------- Unit 2 ---------------- */
T(12, "L12 p29–30", { kind:"letters", letters:[["سَ","sa"],["زَ","za"]], words:["قَسَ","سَكَ","زَرَ","بَسَمَ","حَسَنَ","نَزَلَ"] },
  ["New letters: سَ sa · زَ za", "We clean each part of the body properly"], "L12 p19",
  [ { s:"fiqh", type:"mcq", q:"How do we clean ourselves when we bath?", options:["We clean each part properly","We only splash our face"], answer:0 } ]);
T(13, "L13 p31", { kind:"letters", letters:[["صَ","swa"]], words:["قَصَ","صَبَ","صَلَ","وَصَلَ","نَصَرَ","قَصَدَ"] },
  ["New letter: صَ swa (heavy)", "Rinse your body with clean water"], "L13 p20",
  [ { s:"fiqh", type:"tf", q:"We always rinse our body with clean water.", answer:true } ]);
T(14, "L14 p32", { kind:"review", words:["صَدَقَ","فَصَلَ","كَسَبَ","فَازَ","سَلَفَ","حَسَدَ","مَسَ","سَلَ"] },
  ["Revision words from the Qur'an", "We do not waste water"], "L14 p21",
  [ { s:"fiqh", type:"tf", q:"Muslims do not waste water.", answer:true } ]);
T(15, "L15 p33", { kind:"letters", letters:[["ثَ","tha"]], words:["حَثَ","اَثَ","مَثَلَ","كَثَرَ","اَثَرَ","نَثَرَ"] },
  ["New letter: ثَ tha", "The poem: Hush hush baby"], "L15 poem p22",
  [ { s:"fiqh", type:"match", q:"Hush hush baby! Match the poem", pairs:[["Soap your body","and wash it properly"],["Allaah loves","the tidy"],["Shaytaan likes","the dirty"]] } ]);
T(16, "L16 p34", { kind:"letters", letters:[["ذَ","dha"]], words:["ذَرَ","ذَقَ","شَذَ","نَذَرَ","حَذَرَ","كَذَبَ"] },
  ["New letter: ذَ dha", "Muslims are clean and neat at all times"], "L16 p23",
  [ { s:"fiqh", type:"mcq", q:"In what condition must Muslims be at all times?", options:["Clean and neat","Dirty","Untidy"], answer:0 } ]);
T(17, "L17 p35", { kind:"letters", letters:[["ظَ","zwa"]], words:["ظَحَ","ظَعَ","مَظَ","بَظَ","نَظَرَ","ظَزَ"] },
  ["New letter: ظَ zwa (heavy)", "Wash your hands when you wake up"], "L17 p25",
  [ { s:"fiqh", type:"mcq", q:"What do we do when we wake up in the morning?", options:["We wash our hands","We eat sweets"], answer:0 } ]);
T(18, "L18 p36", { kind:"review", words:["ظَ","زَ","ذَ","سَ","شَ","صَ","ثَ","بَ","فَ","قَ","عَ","ةَ"] },
  ["Review of the letters", "Wash your hands before and after eating"], "L18 p26",
  [ { s:"fiqh", type:"tf", q:"We wash our hands before and after we eat.", answer:true } ]);
T(19, "L19 p37–38", { kind:"letters", letters:[["خَ","kha"],["هَ","ha"]], words:["خَشَ","مَخَ","فَخَرَ","اَخَذَ","دَخَلَ","لَهَ","هَبَ","زَهَرَ"] },
  ["New letters: خَ kha · هَ ha", "Brush your teeth"], "L19 p27",
  [ { s:"fiqh", type:"mcq", q:"How do we take care of our teeth?", options:["We brush our teeth","We eat lots of sweets"], answer:0 } ]);
T(20, "L20 p39", { kind:"letters", letters:[["غَ","gha"]], words:["غَدَ","غَسَ","بَغَ","شَغَلَ","دَغَلَ","شَغَفَ"] },
  ["New letter: غَ gha", "Cut your nails"], "L20 p28",
  [ { s:"fiqh", type:"mcq", q:"Why do we cut our nails?", options:["Long nails carry dirt and germs","To make them shiny"], answer:0 } ]);
T(21, "L21 p40", { kind:"review", words:["غَ","عَ","ءَ","اَ","كَ","قَ","طَ","ظَ","ذَ","زَ","ضَ","صَ","خَ","حَ","هَ"] },
  ["Review of all the letters", "Comb your hair"], "L21 p29",
  [ { s:"fiqh", type:"tf", q:"Untidy hair makes us look dirty, so we comb our hair.", answer:true } ]);
/* ---------------- Unit 3 ---------------- */
T(22, "L22 p41", { kind:"names", items:[["ض","ضَاد"],["ط","طَاء"],["ظ","ظَاء"],["ع","عَيْن"],["غ","غَيْن"],["ف","فَاء"],["ق","قَاف"],["ك","كَاف"],["ل","لَام"],["م","مِيْم"],["ن","نُوْن"],["و","وَاو"],["ه","هَاء"],["ء","هَمْزَة"],["ى","يَاء"]] },
  ["The names of the Arabic letters", "Clean your nose with a tissue or handkerchief"], "L22 p30",
  [ { s:"fiqh", type:"mcq", q:"How do we keep our nose clean?", options:["With tissues or handkerchiefs","With our sleeve"], answer:0 } ]);
T(23, "L23 p42–44", { kind:"harakah", sounds:[["مِ","mi"],["نِ","ni"],["لِ","li"],["تِ","ti"],["فِ","fi"]], sets:[["مَ","مِ"],["نَ","نِ"],["لَ","لِ"],["تَ","تِ"],["فَ","فِ"]], words:["مِنَ","لِمَ","تِلَ","لَتِ","مَنِ","فِ"] },
  ["The kasrah (zer) – the sound ‘i’", "The poem: We are Muslims"], "L23 poem p31",
  [ { s:"fiqh", type:"match", q:"We are Muslims! Match the poem", pairs:[["Our hands","we wash"],["Our teeth","we brush"],["Our nails","we cut"],["Our hair","we comb"]] } ]);
T(24, "L24 p45–48", { kind:"review", words:["قَدِ","بِكَ","بِهِ","تَجِدَ","نَجِدَ","فَشَرِبَ","نَزَلَ","هِيَ"] },
  ["Revision words from the Qur'an with kasrah", "Clean habits"], "L24 p32",
  [ { s:"fiqh", type:"mcq", q:"What happens if we do not clean our teeth?", options:["Our mouth smells and our teeth may rot","Nothing happens"], answer:0 } ]);
T(25, "L25 p49–51", { kind:"review", words:["لَلَلَ","نَنَنَ","يَيَيَ","بَبَبَ","فَفَفَ","لَوَ","شَرَ","رَشَ"] },
  ["Joined letters", "Throw litter in a bin"], "L25 p34",
  [ { s:"fiqh", type:"mcq", q:"What do we do with litter?", options:["Throw it in a bin","Throw it on the floor"], answer:0 } ]);
T(26, "L26 p52–53", { kind:"review", words:["فَعِلَ","وَعِدَ","فَتِحَ","عَمِلَ","فَجَعَلَ","اَمِرَ","اَحَدِ","مَنِعَ"] },
  ["Revision words from the Qur'an", "Do not throw rubbish into a river or dam"], "L26 p35",
  [ { s:"fiqh", type:"tf", q:"On a picnic, we can throw our rubbish into the river.", answer:false, why:"Do not throw dirt and rubbish into a river or dam. Fish in the dams are dying." } ]);
T(27, "L27 p54–55", { kind:"review", words:["فَقَدِ","وَمِنَ","قِبَلَ","شَهِدَ","سَمِعَ","شَرِبَ","لِمَنِ","وَسِعَ"] },
  ["Revision words from the Qur'an", "Keep your room and home tidy"], "L27 p36",
  [ { s:"fiqh", type:"mcq", q:"Which places must we keep tidy?", options:["My home, my room, the masjid and my classroom","Only my room"], answer:0 } ]);
T(28, "L28 p56–60", { kind:"harakah", sounds:[["جُ","ju"],["لُ","lu"],["قُ","qu"]], sets:[["جَ","جِ","جُ"],["لَ","لِ","لُ"],["قَ","قِ","قُ"]], words:["هُوَ","يَدُ","هُمُ","كُمُ"] },
  ["The dhammah (pesh) – the sound ‘u’", "Flush the toilet and keep it clean"], "L28 p37",
  [ { s:"fiqh", type:"tf", q:"We always flush the toilet and keep it clean.", answer:true } ]);
T(29, "L29 p61", { kind:"review", words:["ثَمَرَ","نَظَرَ","حَذَرَ","وَجَدَ","صَدَقَ","وَضَعَ","ظَلَمَ","يَسَرَ"] },
  ["Revision words from the Qur'an", "Pick up dirt and papers"], "L29 p38",
  [ { s:"fiqh", type:"mcq", q:"How can we keep our surroundings clean?", options:["Pick up dirt or papers around us","Leave the papers for someone else"], answer:0 } ]);
T(30, "L30 p62–63", { kind:"review", words:["خَلَقَ","حَسَنَ","كَتَبَ","تَرَكَ","حَجَرَ","غَلَبَ","فَتَحَ","مَطَرَ"] },
  ["Revision words from the Qur'an", "The poem: Careful little Muslims"], "L30 poem p39",
  [ { s:"fiqh", type:"match", q:"Careful, little Muslim! Match the poem", pairs:[["Litter causes","harm to the surroundings"],["Your room","needs tidying"],["The toilet","needs flushing"],["The masjid","needs cleaning"]] } ]);
T(31, "L31 p64–67", { kind:"review", words:["لَكُمُ","وَهُوَ","مَثَلُ","وَرُسُلِ","بِهِمُ","لَهُمُ"] },
  ["Revision words from the Qur'an with dhammah", "Allaah rewards us for keeping our surroundings clean"], "L31 p40",
  [ { s:"fiqh", type:"mcq", q:"Who does Allaah {T} love?", options:["Those who keep themselves pure and clean","Those who make a mess"], answer:0 },
    { s:"fiqh", type:"tf", q:"Allaah {T} rewards us for cleaning our surroundings.", answer:true } ]);
/* ---------------- Unit 4 ---------------- */
T(32, "L32 p68–70", { kind:"harakah", sounds:[["لَمْ","lam"],["نَشْ","nash"],["رَحْ","rah"],["اَلْ","al"]], sets:[["لَمَ","لَمْ"],["نَشَ","نَشْ"],["رَحَ","رَحْ"],["اَلَ","اَلْ"],["نِرَ","نِرْ"],["مِدَ","مِدْ"]] },
  ["The sukoon (jazm) – stop on the letter"]);
T(33, "L33 p71–73", { kind:"review", words:["عَنْ","اِنْ","كُمْ","هِمْ","بَرْ","سَتْ","بِسْ","يَجْ"] }, ["Reading with sukoon"]);
T(34, "L34 p74", { kind:"review", words:["قُلْ","مِنْ","لَمْ","اِذْ","خُسْ","فِرْ","تُفْ","مِدْ"] }, ["Revision of the sukoon"]);
T(35, "L35 p75", { kind:"review", words:["بِسْمِ","يَلِدْ","عَنْهُ","حَمْدِ","صَبْرِ","اِهْدِ","بِكُمْ","فَتْحُ"] }, ["Words with sukoon"]);
T(36, "L36 p76–78", { kind:"review", words:["اَعْبُدُ","اَنْتُمْ","اَرْسَلَ","نَعْبُدُ","نُؤْمِنُ","يَجْعَلُ","حِكْمَةَ","اَطْعَمَ"] }, ["Longer words from the Qur'an"]);
T(37, "L37 p79", { kind:"harakah", sounds:[["كَوْ","kaw"],["صَوْ","saw"]], words:["لَوْ","اَوْ","قَوْ","يَوْمِ","حَوْلَ","فَوْقَ","مَوْتِ"] }, ["وْ with sukoon – kaw, saw"]);
T(38, "L38 p80", { kind:"harakah", sounds:[["اَيْ","ay"],["طَيْ","tay"]], words:["شَيْ","كَيْفَ","طَيْرَ","غَيْبِ","بَيْنَ","حَيْثُ","عَلَيْ"] }, ["يْ with sukoon – ay, tay"]);
T(39, "L39 p81", { kind:"review", words:["عَلَيْهِمْ","اِلَيْكَ","اِلَيْهِ","قَوْمِ","بِغَيْرِ","فِرْعَوْنَ","كَوْثَرَ","عَوْنَ"] }, ["Revision words from the Qur'an"]);
T(40, "L40 p82", { kind:"review", words:["صُمْمُنْ","بُكْمُنْ","عُمْيُنْ","نَفْسُنْ","خَيْرُنْ","لِقَوْمِنْ","عَهْدَنْ","ثَمَنَنْ"] }, ["Getting ready for tanween: words ending in نْ"]);
T(41, "L41 p83–84", { kind:"review", words:["رَبْبُ","مِدْدِ","صَلْلِ","كُلْلِ","حَقْقَ","مُدْدُ","عِزْزَ","خِفْفَ"] }, ["Getting ready for shaddah: double letters"]);
})(window.ULOOM_DATA.lessons);
