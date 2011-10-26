{ft: {i: '1', l: {"l-en": 'Resource'}, d: {"l-en": 'a description'}, t: 'group', s: ["NoIndent", "HiddenValue"], v: 'x', min: 1, pref: 1, max: 1,
   c: [
   {i: '1.1', l: {"l-en": 'Title'}, d: {"l-en": 'title is a'}, t: 'text', v: 't', s: ["LanguageControlled"], max: 4, min: 0},
   {i: '1.2', l: {"l-en": 'Date'}, d: {"l-en": 'date is a'}, t: 'text', v: 'date', max: 1, min: 0},
   {i: '1.3a', l: {"l-en": 'Subjecta'}, d: {"l-en": 'subjecta is a'}, t: 'choice', v: 'subjecta', voc: "v1", max: 1},
   {i: '1.3b', l: {"l-en": 'Subjectb'}, d: {"l-en": 'subjectb is a'}, t: 'choice', v: 'subjectb', voc: "v2", s: ["ExpandableTree"]},
   {i: '1.3c', l: {"l-en": 'Subjectc'}, d: {"l-en": 'subjectc is a'}, t: 'choice', v: 'subjectc', voc: "v2", max: 1},
   {i: '1.4', l: {"l-en": 'Description'}, d: {"l-en": 'desc is a'}, t: 'group', v: 'ad', pref: 0, 
    c: [
    {i: '1.4.1', l: {"l-en": 'Translation'}, d: {"l-en": 'translation is a'}, t: 'text', v: 'd', s: ["MultiLine", "LanguageControlled"]}
      ]},
   {i: '1.5', l: {"l-en": 'Keyword'}, d: {"l-en": 'a keyword is a'}, t: 'text', v: 'k', s: ["NonEditable"]}
    ]
  },
 vocs: {v1: [{d: "http://example.com/instance1", "l-sv": "Matematik", "l-en":"Mathematics"},
 			{d: "http://example.com/instance2", "l-sv": "Kemi", "l-en":"Chemistry"}],
 		v2: [{
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#computerLiteracyItem",
      "selectable": false,
      "children": [{"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#software"}],
      "l": "Computer Literacy Item",
      "top": true
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#windowsVista",
      "l": "windowsVista"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#macOS",
      "selectable": false,
      "children": [{"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#macOsX"}],
      "l": "Mac OS"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#openCalc2",
      "l": "openCalc2"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#presentationTool",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#openImpress2"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#powerPoint2003"}
      ],
      "l": "Presentation Tool"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#spreadsheetProcessor",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#excel2003"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#openCalc2"}
      ],
      "l": "Spreadsheet Processor"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#word2003",
      "l": "word2003"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#google",
      "l": "google"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#internetApplication",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#browser"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#searchEngine"}
      ],
      "l": "Internet Application"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#powerPoint2003",
      "l": "powerPoint2003"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#windows98",
      "l": "windows98"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#firefox2",
      "l": "firefox2"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#searchEngine",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#google"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#msnSearch"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#yahooSearch"}
      ],
      "l": "Search Engine"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#yahooSearch",
      "l": "yahooSearch"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#openImpress2",
      "l": "openImpress2"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#windowsMillenium",
      "l": "windowsMillenium"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#windowsXP",
      "l": "windowsXP"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#browser",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#internetExplorer7"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#firefox2"}
      ],
      "l": "Browser"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#ubuntu606",
      "l": "ubuntu606"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#software",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#operatingSystem"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#application"}
      ],
      "l": "Software"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#macOsX",
      "l": "macOsX"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#officeApplication",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#textProcessor"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#presentationTool"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#spreadsheetProcessor"}
      ],
      "l": "Office Application"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#windows",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#windowsMillenium"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#windowsVista"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#windowsXP"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#windows98"}
      ],
      "l": "Windows"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#linux",
      "selectable": false,
      "children": [{"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#ubuntu606"}],
      "l": "Linux"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#excel2003",
      "l": "excel2003"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#operatingSystem",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#linux"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#windows"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#macOS"}
      ],
      "l": "Operating System"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#internetExplorer7",
      "l": "internetExplorer7"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#msnSearch",
      "l": "msnSearch"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#textProcessor",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#word2003"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#openWriter2"}
      ],
      "l": "Text Processor"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#openWriter2",
      "l": "openWriter2"
    },
    {
      "d": "http://www.uhp-nancy.fr/ontologies/LUISA#application",
      "selectable": false,
      "children": [
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#officeApplication"},
        {"_reference": "http://www.uhp-nancy.fr/ontologies/LUISA#internetApplication"}
      ],
      "l": "Application"
    }]	
 			},
 vars: {x: {nt: 'UR'}, t: {nt: 'PL'}, ad: {nt: 'BR'}, d: {nt: 'LL'}, k: {nt: 'LL'}, date: {nt: 'DL', dt: 'http://www.w3.org/2001/XMLSchema#date'}, subject: {nt: 'UR'}}
}