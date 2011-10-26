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
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Status"},
        "objectVariable": "S",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#status"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#InteractivityLevel"},
        "objectVariable": "IL",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#interactivityLevel"
      },
      {
        "paths": [{
          "objectVariable": "TLTValue",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Duration"},
        "objectVariable": "TLT",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#typicalLearningTime"
      },
      {
        "paths": [{
          "objectVariable": "lang",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/dc/terms/LinguisticSystem"},
        "objectVariable": "EL",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#educationalLanguage"
      },
      {
        "paths": [{
          "objectVariable": "S1",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#LangString"},
        "objectVariable": "OPR",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#otherPlatformRequirements"
      },
      {
        "paths": [{
          "objectVariable": "V",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Duration"},
        "objectVariable": "D",
        "predicate": "http://purl.org/dc/terms/extent"
      },
      {
        "paths": [{
          "paths": [{
            "objectVariable": "VAL",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
          }],
          "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#LangString"},
          "objectVariable": "LS",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Version"},
        "objectVariable": "V1",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#version"
      },
      {
        "paths": [{
          "objectVariable": "S2",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#LangString"},
        "objectVariable": "IR",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#installationRemarks"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Difficulty"},
        "objectVariable": "D1",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#difficulty"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#InteractivityType"},
        "objectVariable": "IT",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#interactivityType"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#SemanticDensity"},
        "objectVariable": "SD",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#semanticDensity"
      },
      {
        "paths": [{
          "paths": [
            {
              "objectVariable": "MIN",
              "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#minimumVersion"
            },
            {
              "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Technology"},
              "objectVariable": "NAME",
              "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#technology"
            },
            {
              "objectVariable": "MAX",
              "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#maximumVersion"
            },
            {
              "objectConstraints": {"http://www.w3.org/2000/01/rdf-schema#subClassOf": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Requirement"},
              "objectVariable": "T",
              "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            }
          ],
          "objectVariable": "REQ",
          "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#alternativeRequirement"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#RequirementOrComposite"},
        "objectVariable": "R",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#requirement"
      }
    ],
    "objectConstraints": [{}],
    "objectVariable": "X"
  },
  "vars": {
    "MAX": {"nt": "AL"},
    "S2": {"nt": "AL"},
    "TLTValue": {
      "nt": "DL",
      "dt": "http://www.w3.org/2001/XMLSchema#Duration"
    },
    "EL": {"nt": "BR"},
    "V1": {"nt": "BR"},
    "OPR": {"nt": "BR"},
    "V": {
      "nt": "DL",
      "dt": "http://www.w3.org/2001/XMLSchema#duration"
    },
    "MIN": {"nt": "AL"},
    "D1": {"nt": "UR"},
    "IL": {"nt": "UR"},
    "S1": {"nt": "AL"},
    "X": {"nt": "AR"},
    "S": {"nt": "UR"},
    "D": {"nt": "BR"},
    "VAL": {"nt": "AL"},
    "REQ": {"nt": "BR"},
    "R": {"nt": "BR"},
    "lang": {
      "nt": "DL",
      "dt": "http://purl.org/dc/terms/RFC3066"
    },
    "IT": {"nt": "UR"},
    "TLT": {"nt": "BR"},
    "LS": {"nt": "BR"},
    "IR": {"nt": "BR"},
    "SD": {"nt": "UR"},
    "NAME": {"nt": "UR"},
    "T": {"nt": "UR"}
  },
  "vocs": {
    "1.3.1.1": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#RequirementType-browser",
        "top": true,
        "l-en": "Browser"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#RequirementType-operatingSystem",
        "top": true,
        "l-en": "Operating System"
      }
    ],
    "1.10": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Difficulty-veryDifficult",
        "top": true,
        "l-en": "Very difficult"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Difficulty-difficult",
        "top": true,
        "l-en": "Difficult"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Difficulty-veryEasy",
        "top": true,
        "l-en": "Very Easy"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Difficulty-easy",
        "top": true,
        "l-en": "Easy"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Difficulty-medium",
        "top": true,
        "l-en": "Medium"
      }
    ],
    "1.8": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityLevel-low",
        "top": true,
        "l-en": "Low"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityLevel-veryLow",
        "top": true,
        "l-en": "Very low"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityLevel-medium",
        "top": true,
        "l-en": "Medium"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityLevel-high",
        "top": true,
        "l-en": "High"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityLevel-veryHigh",
        "top": true,
        "l-en": "Very High"
      }
    ],
    "1.7": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityType-mixed",
        "top": true,
        "l-en": "Mixed"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityType-active",
        "top": true,
        "l-en": "Active"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#InteractivityType-expositive",
        "top": true,
        "l-en": "Expositive"
      }
    ],
    "1.12.1": [
      {
        "d": "ru",
        "top": true,
        "l-en": "Russian"
      },
      {
        "d": "sv",
        "l-sv": "Svenska",
        "top": true,
        "l-en": "Swedish"
      },
      {
        "d": "no",
        "top": true,
        "l-en": "Norwegian"
      },
      {
        "d": "el",
        "top": true,
        "l-en": "Greek"
      },
      {
        "d": "es",
        "top": true,
        "l-en": "Spanish"
      },
      {
        "d": "ro",
        "top": true,
        "l-en": "Romanian"
      },
      {
        "d": "hu",
        "top": true,
        "l-en": "Hungarian"
      },
      {
        "d": "et",
        "top": true,
        "l-en": "Estonian"
      },
      {
        "d": "en",
        "l-sv": "Engelska",
        "top": true,
        "l-en": "English"
      },
      {
        "d": "de",
        "top": true,
        "l-en": "German"
      }
    ],
    "1.3.1.2": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#OSTechnology-macos",
        "top": true,
        "l-en": "OS: MAC OS"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#BrowserTechnology-netscapeCommunicator",
        "top": true,
        "l-en": "Browser: Netscape"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#OSTechnology-pc-dos",
        "top": true,
        "l-en": "OS: PC-DOS"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#BrowserTechnology-amaya",
        "top": true,
        "l-en": "Browser: Amaya"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#OSTechnology-multi-os",
        "top": true,
        "l-en": "OS: Multiple OS"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#OSTechnology-ms-windows",
        "top": true,
        "l-en": "OS: Windows"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#OSTechnology-unix",
        "top": true,
        "l-en": "OS: Unix"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#BrowserTechnology-opera",
        "top": true,
        "l-en": "Browser: Opera"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#OSTechnology-none",
        "top": true,
        "l-en": "OS: none"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#BrowserTechnology-ms-internetExplorer",
        "top": true,
        "l-en": "Browser: Internet Explorer"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#BrowserTechnology-any",
        "top": true,
        "l-en": "Browser: Any"
      }
    ],
    "1.2": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Status-unavailable",
        "top": true,
        "l-en": "Unavailable"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Status-final",
        "top": true,
        "l-en": "Final"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Status-draft",
        "top": true,
        "l-en": "Draft"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Status-revised",
        "top": true,
        "l-en": "Revised"
      }
    ],
    "1.9": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#SemanticDensity-veryLow",
        "top": true,
        "l-en": "Very low"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#SemanticDensity-high",
        "top": true,
        "l-en": "High"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#SemanticDensity-veryHigh",
        "top": true,
        "l-en": "Very High"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#SemanticDensity-low",
        "top": true,
        "l-en": "Low"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#SemanticDensity-medium",
        "top": true,
        "l-en": "Medium"
      }
    ]
  },
  "ft": {
    "i": "1",
    "min": 1,
    "c": [
      {
        "i": "1.1",
        "min": 1,
        "c": [{
          "i": "1.1.1",
          "min": 1,
          "c": [{
            "i": "1.1.1.1",
            "min": 0,
            "t": "text",
            "l": {"l-en": "Version "},
            "pref": 1,
            "s": ["TextFormItem"],
            "v": "VAL"
          }],
          "t": "group",
          "max": 1,
          "pref": 1,
          "s": ["GroupFormItem"],
          "v": "LS"
        }],
        "t": "group",
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "V1"
      },
      {
        "i": "1.2",
        "voc": "1.2",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Status"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "S"
      },
      {
        "i": "1.3",
        "min": 0,
        "c": [{
          "i": "1.3.1",
          "min": 1,
          "c": [
            {
              "i": "1.3.1.1",
              "voc": "1.3.1.1",
              "min": 0,
              "t": "choice",
              "l": {"l": "Type"},
              "pref": 1,
              "s": ["ChoiceFormItem"],
              "v": "T"
            },
            {
              "i": "1.3.1.2",
              "voc": "1.3.1.2",
              "min": 0,
              "t": "choice",
              "l": {"l": "Name"},
              "pref": 1,
              "s": ["ChoiceFormItem"],
              "v": "NAME"
            },
            {
              "i": "1.3.1.3",
              "min": 0,
              "t": "text",
              "l": {"l": "Minimum version"},
              "max": 1,
              "pref": 1,
              "s": ["TextFormItem"],
              "v": "MIN"
            },
            {
              "d": {"l": "\t\t\t"},
              "i": "1.3.1.4",
              "min": 0,
              "t": "text",
              "l": {"l": "Maximum version"},
              "max": 1,
              "pref": 1,
              "s": ["TextFormItem"],
              "v": "MAX"
            }
          ],
          "t": "group",
          "max": 1,
          "pref": 1,
          "s": ["GroupFormItem"],
          "v": "REQ"
        }],
        "t": "group",
        "l": {"l": "Requirement"},
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "R"
      },
      {
        "i": "1.4",
        "min": 1,
        "c": [{
          "i": "1.4.1",
          "min": 0,
          "t": "text",
          "pref": 1,
          "s": [
            "LanguageControlled",
            "TextFormItem"
          ],
          "v": "S2"
        }],
        "t": "group",
        "l": {"l-en": "Installation remarks"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "IR"
      },
      {
        "i": "1.5",
        "min": 1,
        "c": [{
          "i": "1.5.1",
          "min": 0,
          "t": "text",
          "pref": 1,
          "s": [
            "LanguageControlled",
            "TextFormItem"
          ],
          "v": "S1"
        }],
        "t": "group",
        "l": {"l-en": "Other Platform Requirements"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "OPR"
      },
      {
        "i": "1.6",
        "min": 1,
        "c": [{
          "i": "1.6.1",
          "min": 0,
          "t": "text",
          "pref": 1,
          "s": ["TextFormItem"],
          "v": "V"
        }],
        "t": "group",
        "l": {"l-en": "Duration"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "D"
      },
      {
        "d": {"l": "Definition of a LO according to the interactivity type."},
        "i": "1.7",
        "voc": "1.7",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Interactivity Type"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "IT"
      },
      {
        "d": {"l-en": "The degree of interactivity characterizing this learning object. Interactivity in this context refers to the degree to which the learner is supposed to take an active part in dealing with the learning object.\n"},
        "i": "1.8",
        "voc": "1.8",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Interactivity Level"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "IL"
      },
      {
        "d": {"l-en": "The degree of conciseness of a learning object. The semantic density of a learning object may be estimated depending on the relation between the amount of information provided and the size, span or duration of the LO\n"},
        "i": "1.9",
        "voc": "1.9",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Semantic Density"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "SD"
      },
      {
        "d": {"l-en": "How hard it is to work with or through this learning object for the typical intended target audience.\n"},
        "i": "1.10",
        "voc": "1.10",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Difficulty"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "D1"
      },
      {
        "d": {"l-en": "Approximate or time it takes to work with or through this learning object for the typical intended target audience."},
        "i": "1.11",
        "min": 1,
        "c": [{
          "i": "1.11.1",
          "min": 0,
          "t": "text",
          "max": 1,
          "pref": 1,
          "s": ["TextFormItem"],
          "v": "TLTValue"
        }],
        "t": "group",
        "l": {"l-en": "Typical Learning Time"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "TLT"
      },
      {
        "d": {"l": "The human language(s) used by the typical intended user of this learning object."},
        "i": "1.12",
        "min": 1,
        "c": [{
          "i": "1.12.1",
          "voc": "1.12.1",
          "min": 0,
          "t": "choice",
          "pref": 1,
          "s": ["ChoiceFormItem"],
          "v": "lang"
        }],
        "t": "group",
        "l": {"l": "Educational Language"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "EL"
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