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
        "objectVariable": "Y1",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#copyrightAndOtherRestrictions"
      },
      {
        "objectVariable": "Y",
        "predicate": "http://purl.org/dc/terms/description"
      },
      {
        "paths": [{
          "objectVariable": "lang",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectVariable": "Y3",
        "predicate": "http://purl.org/dc/terms/language"
      },
      {
        "objectVariable": "Y2",
        "predicate": "http://purl.org/dc/terms/title"
      }
    ],
    "objectConstraints": [{"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#learningResource"}],
    "objectVariable": "X"
  },
  "vars": {
    "Y3": {"nt": "BR"},
    "lang": {"nt": "DL","dt":"http://purl.org/dc/terms/RFC3066"},
    "Y2": {"nt": "AL"},
    "Y": {"nt": "AL"},
    "Y1": {"nt": "DL","dt":"http://www.w3.org/2001/XMLSchema#boolean"},
    "X": {"nt": "AR"}
  },
  "vocs": {
    "1.2.1": [
      {
        "d": "sv",
        "l-sv": "Svenska",
        "top": true,
        "l-en": "Swedish"
      },
      {
        "d": "en",
        "l-sv": "Engelska",
        "top": true,
        "l-en": "English"
      }
    ],
    "1.4": [
      {
        "d": "true",
        "top": true,
        "l-en": "Yes"
      },
      {
        "d": "false",
        "top": true,
        "l-en": "No"
      }
    ]
  },
  "ft": {
    "i": "1",
    "min": 1,
    "c": [
      {
        "d": {"l-en": "A name given to this learning object"},
        "i": "1.1",
        "min": 1,
        "t": "text",
        "l": {"l-en": "Title"},
        "max": 1,
        "pref": 1,
        "s": [
          "LanguageControlled",
          "TextFormItem"
        ],
        "v": "Y2"
      },
      {
        "d": {"l-en": "The primary human language or languages used within this learning object to communicate to the intended user.\n"},
        "i": "1.2",
        "min": 0,
        "c": [{
          "i": "1.2.1",
          "voc": "1.2.1",
          "min": 0,
          "t": "choice",
          "pref": 1,
          "s": ["ChoiceFormItem"],
          "v": "lang"
        }],
        "t": "group",
        "l": {"l-en": "Language"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "Y3"
      },
      {
        "d": {"l-en": "A textual description of the content of this learning object."},
        "i": "1.3",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Description"},
        "pref": 1,
        "s": [
          "MultiLine",
          "LanguageControlled",
          "TextFormItem"
        ],
        "v": "Y"
      },
      {
        "d": {"l-en": "Comments on the conditions of use of this learning object.\n"},
        "i": "1.4",
        "voc": "1.4",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Copyright and Other Restrictions "},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "Y1"
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