/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

{
  "gp": {
    "paths": [
      {
        "objectVariable": "I",
        "predicate": "http://purl.org/dc/elements/1.1/identifier"
      },
      {
        "objectVariable": "D1",
        "predicate": "http://purl.org/dc/elements/1.1/description"
      },
      {
        "objectVariable": "C1",
        "predicate": "http://purl.org/dc/elements/1.1/contributor"
      },
      {
        "objectVariable": "R",
        "predicate": "http://purl.org/dc/elements/1.1/relation"
      },
      {
        "objectVariable": "D",
        "predicate": "http://purl.org/dc/elements/1.1/date"
      },
      {
        "objectVariable": "C2",
        "predicate": "http://purl.org/dc/elements/1.1/coverage"
      },
      {
        "objectVariable": "T",
        "predicate": "http://purl.org/dc/elements/1.1/title"
      },
      {
        "objectVariable": "S",
        "predicate": "http://purl.org/dc/elements/1.1/source"
      },
      {
        "objectVariable": "P",
        "predicate": "http://purl.org/dc/elements/1.1/publisher"
      },
      {
        "objectVariable": "S1",
        "predicate": "http://purl.org/dc/elements/1.1/subject"
      },
      {
        "objectVariable": "F",
        "predicate": "http://purl.org/dc/elements/1.1/format"
      },
      {
        "objectVariable": "L",
        "predicate": "http://purl.org/dc/elements/1.1/language"
      },
      {
        "objectVariable": "C",
        "predicate": "http://purl.org/dc/elements/1.1/creator"
      },
      {
        "objectVariable": "R1",
        "predicate": "http://purl.org/dc/elements/1.1/rights"
      },
      {
        "objectConstraints": {"http://purl.org/dc/elements/1.1/type": "http://dublincore.org/usage/documents/principles/#vocabulary-term"},
        "objectVariable": "T1",
        "predicate": "http://purl.org/dc/elements/1.1/type"
      }
    ],
    "objectConstraints": [{}],
    "objectVariable": "X"
  },
  "vars": {
    "S": {"nt": "UR"},
    "D": {"nt": "AL"},
    "C2": {"nt": "AL"},
    "R": {"nt": "UR"},
    "R1": {"nt": "AL"},
    "C": {"nt": "AL"},
    "P": {"nt": "AL"},
    "L": {"nt": "AL"},
    "I": {"nt": "UR"},
    "D1": {"nt": "AL"},
    "T1": {"nt": "UR"},
    "F": {"nt": "AL"},
    "T": {"nt": "AL"},
    "C1": {"nt": "AL"},
    "S1": {"nt": "AL"},
    "X": {"nt": "AR"}
  },
  "vocs": {"1.9": [
    {
      "d": "http://purl.org/dc/dcmitype/InteractiveResource",
      "top": true,
      "l-en-US": "Interactive Resource"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Dataset",
      "top": true,
      "l-en-US": "Dataset"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Service",
      "top": true,
      "l-en-US": "Service"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Collection",
      "top": true,
      "l-en-US": "Collection"
    },
    {
      "d": "http://purl.org/dc/dcmitype/StillImage",
      "top": true,
      "l-en-US": "Still Image"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Sound",
      "top": true,
      "l-en-US": "Sound"
    },
    {
      "d": "http://purl.org/dc/dcmitype/MovingImage",
      "top": true,
      "l-en-US": "Moving Image"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Event",
      "top": true,
      "l-en-US": "Event"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Image",
      "top": true,
      "l-en-US": "Image"
    },
    {
      "d": "http://purl.org/dc/dcmitype/PhysicalObject",
      "top": true,
      "l-en-US": "Physical Object"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Text",
      "top": true,
      "l-en-US": "Text"
    },
    {
      "d": "http://purl.org/dc/dcmitype/Software",
      "top": true,
      "l-en-US": "Software"
    }
  ]},
  "ft": {
    "i": "1",
    "min": 1,
    "c": [
      {
        "d": {
          "l-sv": " Resursens namn, given av upphovsmannen eller utgivaren.\n Vanligen är titeln det namn under vilken resursen är känd. Titeln placeras oftast i början av resursen.",
          "l-de": "Titel der Quelle; der vom Verfasser, Urheber oder Verleger vergebene Namen der Ressource",
          "l-en": "A name given to the resource.\nTypically, a Title will be a name by which the resource is formally known."
        },
        "i": "1.1",
        "min": 0,
        "t": "text",
        "l": {
          "l-sv": "Titel",
          "l-de": "Titel",
          "l-en": "Title"
        },
        "pref": 1,
        "s": [
          "LanguageControlled",
          "TextFormItem"
        ],
        "v": "T"
      },
      {
        "d": {
          "l-sv": "En redogörelse för resursens innehåll.\nBeskrivning kan innehålla men behöver inte begränsas till: en abstract, en innehållsförteckning, en referens till en grafisk representation av innehållet eller en fri beskrivning av innehållet.",
          "l-de": "Eine textliche Beschreibung des Ressourceninhalts inklusive eines Referats (Abstract) bei dokumentähnlichen Ressourcen oder Inhaltsbeschreibungen bei graphischen Ressourcen. Künftige Metadata-Sammlungen können auch numerische Inhaltsbeschreibungen (z.B. Spektralanalyse einer graphischen Ressource) enthalten, die eventuell noch nicht in bestehende Netzsysteme eingebettet werden können. In solchen Fällen, kann dieses Feld einen Link zu einer solchen Beschreibung enthalten statt der Beschreibung selbst.",
          "l-en": "An account of the content of the resource.\nDescription may include but is not limited to: an abstract, table of contents, reference to a graphical representation of content or a free-text account of the content."
        },
        "i": "1.2",
        "min": 0,
        "t": "text",
        "l": {
          "l-sv": "Beskrivning",
          "l-de": "Beschreibung",
          "l-en": "Description"
        },
        "pref": 1,
        "s": [
          "MultiLine",
          "LanguageControlled",
          "TextFormItem"
        ],
        "v": "D1"
      },
      {
        "d": {
          "l-sv": "Den enhet som är huvudansvarig för resursens intellektuella innehåll.\nExempel på upphovsman kan vara en person, en organisation, ett företag eller en offentlig förvaltning. Vanligen anger man här upphovsmannens namn.",
          "l-de": "Die Person(en) oder Organisation(en), die den intellektuellen Inhalt verantworten. Z.B. Autoren bei Textdokumenten; Künstler, Photographen bzw. auch andere Bezeichnungen wie Komponist und Maler bei graphischen Dokumenten.",
          "l-en": "An entity primarily responsible for making the content of the resource.  \nExamples of a Creator include a person, an organisation, or a service. Typically, the name of a Creator should be used to indicate the entity."
        },
        "i": "1.3",
        "min": 0,
        "t": "text",
        "l": {
          "l-sv": "Skapare",
          "l-de": "Verfasser",
          "l-en": "Creator"
        },
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "C"
      },
      {
        "d": {
          "l-sv": "Den enhet som har bidragit till innehållet i resursen.\nExempel på medarbetare kan vara en person, en organisation, ett företag eller en offentlig förvaltning. Vanligen anger man här medarbetarens namn.",
          "l-de": " Zusätzliche Person(en) und Organisation(en) zu jenen, die im Element 2 (DC.CREATOR) genannt wurden, die einen bedeutsamen intellektuellen Beitrag zur Ressource geleistet haben, deren Beitrag aber sekundär im Verhältnis zu denen im Element 2 (DC.CREATOR) zu betrachten ist (z.B. Herausgeber, Übersetzer, Illustratoren, auch Konferenzleiter, Moderatoren).\n                ",
          "l-en": "An entity responsible for making contributions to the content of the resource.\nExamples of a Contributor include a person, an organisation, or a service. Typically, the name of a Contributor should be used to indicate the entity."
        },
        "i": "1.4",
        "min": 0,
        "t": "text",
        "l": {
          "l-sv": "Medarbetare",
          "l-de": "Weitere beteiligten Personen und Körperschaften",
          "l-en": "Contributor"
        },
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "C1"
      },
      {
        "d": {
          "l-sv": "Den enhet som är ansvarig för att ha gjort resursen tillgänglig.\nExempel på utgivare kan vara en person, en organisation, ett företag eller en offentlig förvaltning. Vanligen anger man här utgivarens namn.",
          "l-de": "Die Einrichtung, die verantwortet, daß diese Ressource in dieser Form zur Verfügung steht, wie z.B. ein Verleger, ein Herausgeber, eine Universität oder eine korporatives Unternehmen. Der Zweck bei der Benutzung dieses Felds ist es, die Einrichtung oder Einheit zu identifizieren, die den Zugang zur Ressource gewährt.",
          "l-en": "An entity responsible for making the resource available\nExamples of a Publisher include a person, an organisation, or a service. Typically, the name of a Publisher should be used to indicate the entity."
        },
        "i": "1.5",
        "min": 0,
        "t": "text",
        "l": {
          "l-sv": "Utgivare",
          "l-de": "Verleger",
          "l-en": "Publisher"
        },
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "P"
      },
      {
        "d": {
          "l-sv": "Ämnet för resursens innehåll.\nVanligen uttrycks ett ämne med hjälp av nyckelord/fraser eller klassifikationskoder som beskriver vad resursen handlar om.\nRekommendation: välj gärna nyckelord eller koder ur kontrollerade ämnesordslistor och formella klassifikationsscheman.",
          "l-de": "Thema, Schlagwort, Stichwort. Das Thema der Ressource bzw. Stichwörter oder Phrasen, die das Thema oder den Inhalt beschreiben. Die beabsichtigte Spezifizierung dieses Elements dient der Entwicklung eines kontrollierten Vokabulars. Das Element kann sowohl systematische Daten nach einer Klassifikation (SCHEME), wie Library of Congress Klassifikations-Nummer oder UDC-Nummer oder Begriffe aus anerkannten Thesauri (wie MEdical Subject Headings (MESH) und Art and Architecture Thesaurus (AAT) Deskriptoren) enthalten.",
          "l-en": "The topic of the content of the resource.\nTypically, a Subject will be expressed as keywords, key phrases or classification codes that describe a topic of the resource. Recommended best practice is to select a value from a controlled vocabulary or formal classification scheme."
        },
        "i": "1.6",
        "min": 0,
        "t": "text",
        "l": {
          "l-sv": "Ämne",
          "l-de": "Thema",
          "l-en": "Subject"
        },
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "S1"
      },
      {
        "d": {"l-en": "A date of an event in the lifecycle of the resource.\nTypically, Date will be associated with the creation or availability of the resource. Recommended best practice for encoding the date value is defined in a profile of ISO 8601 [W3CDTF] and includes (among others) dates of the form YYYY-MM-DD."},
        "i": "1.7",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Date"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "D"
      },
      {
        "d": {"l-en": "The physical or digital manifestation of the resource.\nTypically, Format may include the media-type or dimensions of the resource. Format may be used to identify the software, hardware, or other equipment needed to display or operate the resource. Examples of dimensions include size and duration. Recommended best practice is to select a value from a controlled vocabulary (for example, the list of Internet Media Types [MIME] defining computer media formats)."},
        "i": "1.8",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Format"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "F"
      },
      {
        "d": {"l-en": "According to the Dublin Core Metadata Initiative Types (DCMITypes)."},
        "i": "1.9",
        "voc": "1.9",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Resource Type"},
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "T1"
      },
      {
        "d": {"l-en": "A language of the intellectual content of the resource.\nRecommended best practice is to use RFC 3066 [RFC3066] which, in conjunction with ISO639 [ISO639]), defines two- and three-letter primary language tags with optional subtags. Examples include \"en\" or \"eng\" for English, \"akk\" for Akkadian\", and \"en-GB\" for English used in the United Kingdom."},
        "i": "1.10",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Language"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "L"
      },
      {
        "d": {"l-en": "An unambiguous reference to the resource within a given context.\nRecommended best practice is to identify the resource by means of a string or number conforming to a formal identification system. Formal identification systems include but are not limited to the Uniform Resource Identifier (URI) (including the Uniform Resource Locator (URL)), the Digital Object Identifier (DOI) and the International Standard Book Number (ISBN)."},
        "i": "1.11",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Resource Identifier"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "I"
      },
      {
        "d": {"l-en": "The extent or scope of the content of the resource.\nTypically, Coverage will include spatial location (a place name or geographic coordinates), temporal period (a period label, date, or date range) or jurisdiction (such as a named administrative entity). Recommended best practice is to select a value from a controlled vocabulary (for example, the Thesaurus of Geographic Names [TGN]) and to use, where appropriate, named places or time periods in preference to numeric identifiers such as sets of coordinates or date ranges."},
        "i": "1.12",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Coverage"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "C2"
      },
      {
        "d": {"l-en": "A reference to a related resource.\nRecommended best practice is to identify the referenced resource by means of a string or number conforming to a formal identification system."},
        "i": "1.13",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Relation"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "R"
      },
      {
        "d": {"l-en": "A Reference to a resource from which the present resource is derived.\nThe present resource may be derived from the Source resource in whole or in part. Recommended best practice is to identify the referenced resource by means of a string or number conforming to a formal identification system."},
        "i": "1.14",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Source"},
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "S"
      },
      {
        "d": {"l-en": "Information about rights held in and over the resource.\nTypically, Rights will contain a rights management statement for the resource, or reference a service providing such information. Rights information often encompasses Intellectual Property Rights (IPR), Copyright, and various Property Rights. If the Rights element is absent, no assumptions may be made about any rights held in or over the resource."},
        "i": "1.15",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Rights Management"},
        "pref": 1,
        "s": [
          "MultiLine",
          "TextFormItem"
        ],
        "v": "R1"
      }
    ],
    "t": "group",
    "l": {
      "l-sv": "Resurs",
      "l-de": "Ressource",
      "l-en": "Resource"
    },
    "max": 1,
    "pref": 0,
    "s": ["GroupFormItem"],
    "v": "X"
  }
}
