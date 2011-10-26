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
        "objectVariable": "Y2",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#copyrightAndOtherRestrictions"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Concepts"},
        "objectVariable": "AR",
        "predicate": "http://purl.org/dc/terms/subject"
      },
      {
        "objectVariable": "T",
        "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
      },
      {
        "objectVariable": "A",
        "predicate": "http://purl.org/dc/terms/rights"
      },
      {
        "paths": [{
          "objectVariable": "lang",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/dc/terms/LinguisticSystem"},
        "objectVariable": "Y1",
        "predicate": "http://purl.org/dc/terms/language"
      },
      {
        "objectVariable": "Y",
        "predicate": "http://purl.org/dc/terms/title"
      },
      {
        "paths": [{
          "objectVariable": "kw",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#LangString"},
        "objectVariable": "Y3",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#keyword"
      },
      {
        "objectVariable": "C1",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#cost"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Structure"},
        "objectVariable": "Structure",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#structure"
      },
      {
        "objectVariable": "C",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#context"
      },
      {
        "paths": [{
          "objectVariable": "value",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#LangString"},
        "objectVariable": "TAR",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#typicalAgeRange"
      },
      {
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/dc/terms/AgentClass"},
        "objectVariable": "IEUR",
        "predicate": "http://purl.org/dc/terms/audience"
      },
      {
        "objectVariable": "Y5",
        "predicate": "http://purl.org/dc/terms/description"
      },
      {
        "paths": [{
          "objectVariable": "value1",
          "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
        }],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#LangString"},
        "objectVariable": "D",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#educationalDescription"
      },
      {
        "paths": [
          {
            "objectVariable": "Entity",
            "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#entity"
          },
          {
            "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Role"},
            "objectVariable": "Role",
            "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#role"
          },
          {
            "objectVariable": "date",
            "predicate": "http://purl.org/dc/terms/date"
          }
        ],
        "objectConstraints": {"http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://ltsc.ieee.org/rdf/lomv1p0/lom#Contribute"},
        "objectVariable": "Y4",
        "predicate": "http://ltsc.ieee.org/rdf/lomv1p0/lom#contribute"
      }
    ],
    "objectConstraints": [{}],
    "objectVariable": "X"
  },
  "vars": {
    "Y3": {"nt": "BR"},
    "D": {"nt": "BR"},
    "value": {"nt": "AL"},
    "Y4": {"nt": "BR"},
    "lang": {
      "nt": "DL",
      "dt": "http://purl.org/dc/terms/RFC3066"
    },
    "C": {"nt": "AL"},
    "Y5": {"nt": "AL"},
    "date": {
      "nt": "DL",
      "dt": "http://purl.org/dc/terms/W3CDTF"
    },
    "AR": {"nt": "UR"},
    "IEUR": {"nt": "UR"},
    "Structure": {"nt": "UR"},
    "kw": {"nt": "AL"},
    "value1": {"nt": "AL"},
    "A": {"nt": "AL"},
    "Entity": {
      "nt": "DL",
      "dt": "http://ltsc.ieee.org/rdf/lomv1p0/lom#VCard"
    },
    "TAR": {"nt": "BR"},
    "Y": {"nt": "AL"},
    "Y2": {
      "nt": "DL",
      "dt": "http://www.w3.org/2001/XMLSchema#boolean"
    },
    "T": {"nt": "AL"},
    "C1": {
      "nt": "DL",
      "dt": "http://www.w3.org/2001/XMLSchema#boolean"
    },
    "Role": {"nt": "UR"},
    "Y1": {"nt": "BR"},
    "X": {"nt": "AR"}
  },
  "vocs": {
    "1.6.1": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-subjectMatterExpert",
        "top": true,
        "l-en": "Subject Matter Expert"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-technicalValidator",
        "top": true,
        "l-en": "Technical Validator"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-publisher",
        "top": true,
        "l-en": "Publisher"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-author",
        "top": true,
        "l-en": "Author"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-instructionalDesigner",
        "top": true,
        "l-en": "Instructional Designer"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-editor",
        "top": true,
        "l-en": "Editor"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-unknown",
        "top": true,
        "l-en": "Unknown"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-terminator",
        "top": true,
        "l-en": "Terminator"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-educationalValidator",
        "top": true,
        "l-en": "Educational Validator"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-scriptWriter",
        "top": true,
        "l-en": "Script writer"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-validator",
        "top": true,
        "l-en": "Validator"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-graphicalDesigner",
        "top": true,
        "l-en": "Graphical Designer"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-initiator",
        "top": true,
        "l-en": "Initiator"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-creator",
        "top": true,
        "l-en": "Creator"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-contentProvider",
        "top": true,
        "l-en": "Content Provider"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Role-techicalImplementer",
        "top": true,
        "l-en": "Technical Implementer"
      }
    ],
    "1.5": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Structure-networked",
        "top": true,
        "l-en": "Networked"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Structure-atomic",
        "top": true,
        "l-en": "Atomic"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Structure-collection",
        "top": true,
        "l-en": "Collection"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Structure-linear",
        "top": true,
        "l-en": "Linear"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Structure-hierarchical",
        "top": true,
        "l-en": "Hierarchical"
      }
    ],
    "1.15": [
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Nitrogen",
        "top": true,
        "l": "Nitrogen"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiminutionOfHumus",
        "top": true,
        "l": "DiminutionOfHumus"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FieldCropsCultivation",
        "top": true,
        "l": "FieldCropsCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EUOrganicStandard",
        "top": true,
        "l": "EUOrganicStandard"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Beer",
        "top": true,
        "l": "Beer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#QualityPerception",
        "top": true,
        "l": "QualityPerception"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalBreeds",
        "top": true,
        "l": "LocalBreeds"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ShelfLife",
        "top": true,
        "l": "ShelfLife"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GeneticResistence",
        "top": true,
        "l": "GeneticResistence"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CertificationProcess",
        "top": true,
        "l": "CertificationProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MeatProductionProcess",
        "top": true,
        "l": "MeatProductionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicConversion",
        "top": true,
        "l": "OrganicConversion"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Polyculture",
        "top": true,
        "l": "Polyculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Corn",
        "top": true,
        "l": "Corn"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Biosolids",
        "top": true,
        "l": "Biosolids"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RabbitMeat",
        "top": true,
        "l": "RabbitMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilHusbandry",
        "top": true,
        "l": "SoilHusbandry"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActionResearch",
        "top": true,
        "l": "ActionResearch"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalTransport",
        "top": true,
        "l": "AnimalTransport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#TraditionalFarming",
        "top": true,
        "l": "TraditionalFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MilkProduction",
        "top": true,
        "l": "MilkProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunityService",
        "top": true,
        "l": "CommunityService"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnvironmentalImpact",
        "top": true,
        "l": "EnvironmentalImpact"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductIntegrity",
        "top": true,
        "l": "ProductIntegrity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MarketTrends",
        "top": true,
        "l": "MarketTrends"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Teaching",
        "top": true,
        "l": "Teaching"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sustainability",
        "top": true,
        "l": "Sustainability"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilDegradation",
        "top": true,
        "l": "SoilDegradation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Wool",
        "top": true,
        "l": "Wool"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalFood",
        "top": true,
        "l": "NaturalFood"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LowInputAgriculture",
        "top": true,
        "l": "LowInputAgriculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Salt",
        "top": true,
        "l": "Salt"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropEcology",
        "top": true,
        "l": "CropEcology"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilHealth",
        "top": true,
        "l": "SoilHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Consumer",
        "top": true,
        "l": "Consumer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HerbCultivation",
        "top": true,
        "l": "HerbCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Hamburger",
        "top": true,
        "l": "Hamburger"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Milk",
        "top": true,
        "l": "Milk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MilkProductionProcess",
        "top": true,
        "l": "MilkProductionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Tofu",
        "top": true,
        "l": "Tofu"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PoultryMeat",
        "top": true,
        "l": "PoultryMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Accreditation",
        "top": true,
        "l": "Accreditation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MultiCropping",
        "top": true,
        "l": "MultiCropping"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FishFarming",
        "top": true,
        "l": "FishFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilTillage",
        "top": true,
        "l": "SoilTillage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmSale",
        "top": true,
        "l": "FarmSale"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PastureManagement",
        "top": true,
        "l": "PastureManagement"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeDistribution",
        "top": true,
        "l": "AlternativeDistribution"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WeedControl",
        "top": true,
        "l": "WeedControl"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FruitProduction",
        "top": true,
        "l": "FruitProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SlaughterHouseWaste",
        "top": true,
        "l": "SlaughterHouseWaste"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LambMeat",
        "top": true,
        "l": "LambMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Dairy",
        "top": true,
        "l": "Dairy"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SheepMilk",
        "top": true,
        "l": "SheepMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilStructure",
        "top": true,
        "l": "SoilStructure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GreenCare",
        "top": true,
        "l": "GreenCare"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sterilization",
        "top": true,
        "l": "Sterilization"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fermentation",
        "top": true,
        "l": "Fermentation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EggProduction",
        "top": true,
        "l": "EggProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ExtensiveFarming",
        "top": true,
        "l": "ExtensiveFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChileanSaltpeter",
        "top": true,
        "l": "ChileanSaltpeter"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodProcessing",
        "top": true,
        "l": "FoodProcessing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Viticulture",
        "top": true,
        "l": "Viticulture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sowing",
        "top": true,
        "l": "Sowing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Breeding",
        "top": true,
        "l": "Breeding"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConsumerAttitudes",
        "top": true,
        "l": "ConsumerAttitudes"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnergyEfficiency",
        "top": true,
        "l": "EnergyEfficiency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GMOAvoidance",
        "top": true,
        "l": "GMOAvoidance"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalBehaviour",
        "top": true,
        "l": "NaturalBehaviour"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProtection",
        "top": true,
        "l": "PlantProtection"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Permaculture",
        "top": true,
        "l": "Permaculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CompanionPlanting",
        "top": true,
        "l": "CompanionPlanting"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeCrops",
        "top": true,
        "l": "AlternativeCrops"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalHusbandry",
        "top": true,
        "l": "AnimalHusbandry"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalResources",
        "top": true,
        "l": "LocalResources"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Research",
        "top": true,
        "l": "Research"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilCompaction",
        "top": true,
        "l": "SoilCompaction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Feather",
        "top": true,
        "l": "Feather"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ExtensiveGrazing",
        "top": true,
        "l": "ExtensiveGrazing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Urea",
        "top": true,
        "l": "Urea"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Leather",
        "top": true,
        "l": "Leather"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GreenManure",
        "top": true,
        "l": "GreenManure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NutrientDeficiency",
        "top": true,
        "l": "NutrientDeficiency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicStandard",
        "top": true,
        "l": "OrganicStandard"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsExport",
        "top": true,
        "l": "ProductsExport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalProduction",
        "top": true,
        "l": "LocalProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Ecoturism",
        "top": true,
        "l": "Ecoturism"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LivestockHousing",
        "top": true,
        "l": "LivestockHousing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CertificationAgency",
        "top": true,
        "l": "CertificationAgency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RuralLivelihoods",
        "top": true,
        "l": "RuralLivelihoods"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodShed",
        "top": true,
        "l": "FoodShed"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Producer",
        "top": true,
        "l": "Producer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EcologicalFootprint",
        "top": true,
        "l": "EcologicalFootprint"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiseasesPrevention",
        "top": true,
        "l": "DiseasesPrevention"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantHealth",
        "top": true,
        "l": "PlantHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropResidue",
        "top": true,
        "l": "CropResidue"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fodder",
        "top": true,
        "l": "Fodder"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#N-Fixation",
        "top": true,
        "l": "N-Fixation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CattleMeat",
        "top": true,
        "l": "CattleMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicCertification",
        "top": true,
        "l": "OrganicCertification"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislationOnOrganicFertilizers",
        "top": true,
        "l": "EULegislationOnOrganicFertilizers"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FodderManagement",
        "top": true,
        "l": "FodderManagement"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicPrinciple",
        "top": true,
        "l": "OrganicPrinciple"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChickenMeat",
        "top": true,
        "l": "ChickenMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WaterQuality",
        "top": true,
        "l": "WaterQuality"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ShellAquaculture",
        "top": true,
        "l": "ShellAquaculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Diet",
        "top": true,
        "l": "Diet"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#BeeOrigin",
        "top": true,
        "l": "BeeOrigin"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropRotation",
        "top": true,
        "l": "CropRotation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LandOwner",
        "top": true,
        "l": "LandOwner"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodHealth",
        "top": true,
        "l": "FoodHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FodderPreference",
        "top": true,
        "l": "FodderPreference"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Distributor",
        "top": true,
        "l": "Distributor"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RenewevableResources",
        "top": true,
        "l": "RenewevableResources"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Potassium",
        "top": true,
        "l": "Potassium"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MeatProduction",
        "top": true,
        "l": "MeatProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ClimateChangeMitigation",
        "top": true,
        "l": "ClimateChangeMitigation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Barley",
        "top": true,
        "l": "Barley"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunitySupportedAgriculture",
        "top": true,
        "l": "CommunitySupportedAgriculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilBiology",
        "top": true,
        "l": "SoilBiology"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantNutrition",
        "top": true,
        "l": "PlantNutrition"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalNutrition",
        "top": true,
        "l": "NaturalNutrition"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Training",
        "top": true,
        "l": "Training"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Honey",
        "top": true,
        "l": "Honey"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RegulatoryAgency",
        "top": true,
        "l": "RegulatoryAgency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActionLearning",
        "top": true,
        "l": "ActionLearning"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AgroFoodSystem",
        "top": true,
        "l": "AgroFoodSystem"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsImport",
        "top": true,
        "l": "ProductsImport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#IFOAMPrinciples",
        "top": true,
        "l": "IFOAMPrinciples"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiseasesTreatment",
        "top": true,
        "l": "DiseasesTreatment"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodSafety",
        "top": true,
        "l": "FoodSafety"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WineProductionProcess",
        "top": true,
        "l": "WineProductionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CerealsCultivation",
        "top": true,
        "l": "CerealsCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Phosphorus",
        "top": true,
        "l": "Phosphorus"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilbiologicalActivity",
        "top": true,
        "l": "SoilbiologicalActivity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ISO14000Program",
        "top": true,
        "l": "ISO14000Program"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sausage",
        "top": true,
        "l": "Sausage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsTransport",
        "top": true,
        "l": "ProductsTransport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmersMarket",
        "top": true,
        "l": "FarmersMarket"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FeatherProduction",
        "top": true,
        "l": "FeatherProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LeatherProduction",
        "top": true,
        "l": "LeatherProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DirectMarketing",
        "top": true,
        "l": "DirectMarketing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilFertility",
        "top": true,
        "l": "SoilFertility"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalHealth",
        "top": true,
        "l": "AnimalHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Storage",
        "top": true,
        "l": "Storage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PigMeat",
        "top": true,
        "l": "PigMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PovertyAlleviation",
        "top": true,
        "l": "PovertyAlleviation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoyaDrink",
        "top": true,
        "l": "SoyaDrink"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Meat",
        "top": true,
        "l": "Meat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#BuffaloMilk",
        "top": true,
        "l": "BuffaloMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OutdoorKeeping",
        "top": true,
        "l": "OutdoorKeeping"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AquaCulture",
        "top": true,
        "l-en": "aquaculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodAvailability",
        "top": true,
        "l": "FoodAvailability"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Plowing",
        "top": true,
        "l": "Plowing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilessCulture",
        "top": true,
        "l": "SoilessCulture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Diversity",
        "top": true,
        "l": "Diversity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalManure",
        "top": true,
        "l": "AnimalManure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodQuality",
        "top": true,
        "l": "FoodQuality"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Humus",
        "top": true,
        "l": "Humus"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Compost",
        "top": true,
        "l": "Compost"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Cheese",
        "top": true,
        "l": "Cheese"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Jelly",
        "top": true,
        "l": "Jelly"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PreCooling",
        "top": true,
        "l": "PreCooling"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Farmer",
        "top": true,
        "l": "Farmer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalEthics",
        "top": true,
        "l": "AnimalEthics"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Learning",
        "top": true,
        "l": "Learning"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GoatMilk",
        "top": true,
        "l": "GoatMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fertilization",
        "top": true,
        "l": "Fertilization"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PestControl",
        "top": true,
        "l": "PestControl"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Pollution",
        "top": true,
        "l": "Pollution"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WellBeing",
        "top": true,
        "l": "WellBeing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LabelingRegulation",
        "top": true,
        "l": "LabelingRegulation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PreStorage",
        "top": true,
        "l": "PreStorage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeFarming",
        "top": true,
        "l": "AlternativeFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HACCP",
        "top": true,
        "l": "HACCP"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Apiculture",
        "top": true,
        "l": "Apiculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NutrientRecycling",
        "top": true,
        "l": "NutrientRecycling"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislationOnGMO",
        "top": true,
        "l": "EULegislationOnGMO"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Manure",
        "top": true,
        "l": "Manure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Biodiversity",
        "top": true,
        "l": "Biodiversity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislation",
        "top": true,
        "l": "EULegislation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Wheat",
        "top": true,
        "l": "Wheat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CowMilk",
        "top": true,
        "l": "CowMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilAcidification",
        "top": true,
        "l": "SoilAcidification"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Farm",
        "top": true,
        "l": "Farm"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicMatter",
        "top": true,
        "l": "OrganicMatter"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnergyCropsCultivation",
        "top": true,
        "l": "EnergyCropsCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CulturalLandscapes",
        "top": true,
        "l": "CulturalLandscapes"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilErosion",
        "top": true,
        "l": "SoilErosion"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CO2Miles",
        "top": true,
        "l": "CO2Miles"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EUOrganicCertification",
        "top": true,
        "l": "EUOrganicCertification"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConversionProcess",
        "top": true,
        "l": "ConversionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#InterCropping",
        "top": true,
        "l-en": "intercropping"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CarbonSequestration",
        "top": true,
        "l": "CarbonSequestration"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalWelfare",
        "top": true,
        "l": "AnimalWelfare"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilConservation",
        "top": true,
        "l": "SoilConservation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PostHarvestHandling",
        "top": true,
        "l": "PostHarvestHandling"
      }
    ],
    "1.10": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Context-higherEducation",
        "top": true,
        "l": "Higher education"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-specialEducation",
        "top": true,
        "l": "Special education"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-preSchool",
        "top": true,
        "l": "Pre-school"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-library",
        "top": true,
        "l": "Library"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-distanceEducation",
        "top": true,
        "l": "Distance education"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-policyMaking",
        "top": true,
        "l": "Policy making"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-continuingEducation",
        "top": true,
        "l": "Continuing education"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-educationalAdministration",
        "top": true,
        "l": "Educational administration"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-professionalDevelopment",
        "top": true,
        "l": "Professional development"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-compulsoryEducation",
        "top": true,
        "l": "Compulsory education"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#Context-other",
        "top": true,
        "l": "Other"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#Context-vocationalEducation",
        "top": true,
        "l": "Vocational education"
      }
    ],
    "1.13": [
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
    ],
    "1.8": [
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#IntendedEndUserRole-manager",
        "top": true,
        "l-en": "Manager"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#IntendedEndUserRole-learner",
        "top": true,
        "l-en": "Learner"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#IntendedEndUserRole-author",
        "top": true,
        "l-en": "Author"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#IntendedEndUserRole-other",
        "top": true,
        "l-en": "Other"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#IntendedEndUserRole-parent",
        "top": true,
        "l-en": "Parent"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#IntendedEndUserRole-counsellor",
        "top": true,
        "l-en": "Counsellor"
      },
      {
        "d": "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#IntendedEndUserRole-teacher",
        "top": true,
        "l-en": "Teacher"
      }
    ],
    "1.7": [
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-rolePlay",
        "top": true,
        "l-en": "Role play"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-learningAsset-image",
        "top": true,
        "l-en": "Learning asset: Image"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-reference",
        "top": true,
        "l-en": "Reference"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-caseStudy",
        "top": true,
        "l-en": "Case study"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-openActivity",
        "top": true,
        "l-en": "Open activity"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-lessonPlan",
        "top": true,
        "l-en": "Lesson plan"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-demonstration",
        "top": true,
        "l-en": "Demonstration"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-learningAsset-audio",
        "top": true,
        "l-en": "Learning asset: Audio"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-tool",
        "top": true,
        "l-en": "Tool"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-learningAsset-text",
        "top": true,
        "l-en": "Learning asset: Text"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-learningAsset-model",
        "top": true,
        "l-en": "Learning asset: Model"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-drillAndPractice",
        "top": true,
        "l-en": "Drill and practice"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-educationalGame",
        "top": true,
        "l-en": "Educational game"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-webResource-weblog",
        "top": true,
        "l-en": "Web resource: Weblog"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-learningAsset-video",
        "top": true,
        "l-en": "Learning asset: Video"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-broadcast",
        "top": true,
        "l-en": "Broadcast"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-project",
        "top": true,
        "l-en": "Project"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-webResource-wiki",
        "top": true,
        "l-en": "Web resource: Wiki"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-learningAsset-data",
        "top": true,
        "l-en": "Learning asset: Data"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-glossary",
        "top": true,
        "l-en": "Glossary"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-webResource-webPage",
        "top": true,
        "l-en": "Web resource: Web Page"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-guide",
        "top": true,
        "l-en": "Guide"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-enquiryOrientedActivity",
        "top": true,
        "l-en": "Enquiry-oriented activity"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-webResource-otherWebResource",
        "top": true,
        "l-en": "Web resource:Other web resource"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-experiment",
        "top": true,
        "l-en": "Experiment"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-course",
        "top": true,
        "l-en": "Course"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-other",
        "top": true,
        "l-en": "Other"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-simulation",
        "top": true,
        "l-en": "Simulation"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-application",
        "top": true,
        "l-en": "Application"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-assessment",
        "top": true,
        "l-en": "Assessment"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-exploration",
        "top": true,
        "l-en": "Exploration"
      },
      {
        "d": "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-presentation",
        "top": true,
        "l-en": "Presentation"
      }
    ],
    "1.2.1": [
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
    "1.12": [
      {
        "d": "true",
        "top": true,
        "l-en": "Some cost"
      },
      {
        "d": "false",
        "top": true,
        "l-en": "No cost"
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
        "l": {"l-en": "Title*"},
        "pref": 1,
        "s": [
          "LanguageControlled",
          "TextFormItem"
        ],
        "v": "Y"
      },
      {
        "d": {"l-en": "The primary human language or languages used within this learning object to communicate to the intended user.\n"},
        "i": "1.2",
        "min": 1,
        "c": [{
          "i": "1.2.1",
          "voc": "1.2.1",
          "min": 1,
          "t": "choice",
          "pref": 1,
          "s": ["ChoiceFormItem"],
          "v": "lang"
        }],
        "t": "group",
        "l": {"l-en": "Language*"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "Y1"
      },
      {
        "d": {"l-en": "A textual description of the content of this learning object."},
        "i": "1.3",
        "min": 1,
        "t": "text",
        "l": {"l-en": "Description*"},
        "pref": 1,
        "s": [
          "MultiLine",
          "LanguageControlled",
          "TextFormItem"
        ],
        "v": "Y5"
      },
      {
        "i": "1.4",
        "min": 0,
        "c": [{
          "i": "1.4.1",
          "min": 0,
          "t": "text",
          "pref": 1,
          "s": [
            "LanguageControlled",
            "TextFormItem"
          ],
          "v": "kw"
        }],
        "t": "group",
        "l": {"l-en": "Keyword"},
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "Y3"
      },
      {
        "i": "1.5",
        "voc": "1.5",
        "min": 0,
        "t": "choice",
        "l": {
          "l-sv": "Struktur",
          "l-de": "Struktur",
          "l-en": "Structure"
        },
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "Structure"
      },
      {
        "i": "1.6",
        "min": 0,
        "c": [
          {
            "i": "1.6.1",
            "voc": "1.6.1",
            "min": 1,
            "t": "choice",
            "l": {"l": "Role"},
            "max": 1,
            "pref": 1,
            "s": ["ChoiceFormItem"],
            "v": "Role"
          },
          {
            "i": "1.6.2",
            "min": 1,
            "t": "text",
            "l": {"l": "Entity"},
            "pref": 1,
            "s": ["TextFormItem"],
            "v": "Entity"
          },
          {
            "i": "1.6.3",
            "min": 1,
            "t": "text",
            "l": {"l": "Date"},
            "max": 1,
            "pref": 1,
            "s": ["TextFormItem"],
            "v": "date"
          }
        ],
        "t": "group",
        "l": {"l-en": "Contribution "},
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "Y4"
      },
      {
        "i": "1.7",
        "voc": "1.7",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Learning Resource Type"},
        "max": 10,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "T"
      },
      {
        "d": {"l-en": "Principal user(s) for which this learning\nobject was designed, most dominant first."},
        "i": "1.8",
        "voc": "1.8",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Intended End User Role"},
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "IEUR"
      },
      {
        "i": "1.9",
        "min": 0,
        "c": [{
          "i": "1.9.1",
          "min": 0,
          "t": "text",
          "max": 1,
          "pref": 1,
          "s": [
            "LanguageControlled",
            "TextFormItem"
          ],
          "v": "value"
        }],
        "t": "group",
        "l": {"l-en": "Typical Age Range"},
        "max": 1,
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "TAR"
      },
      {
        "d": {"l-en": "The principal environment within which the\nlearning and use of this learning object is\nintended to take place."},
        "i": "1.10",
        "voc": "1.10",
        "min": 0,
        "t": "choice",
        "l": {"l-en": "Context"},
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "C"
      },
      {
        "i": "1.11",
        "min": 0,
        "c": [{
          "i": "1.11.1",
          "min": 0,
          "t": "text",
          "pref": 1,
          "s": [
            "LanguageControlled",
            "TextFormItem"
          ],
          "v": "value1"
        }],
        "t": "group",
        "l": {"l-en": "Educational description"},
        "pref": 1,
        "s": ["GroupFormItem"],
        "v": "D"
      },
      {
        "i": "1.12",
        "voc": "1.12",
        "min": 1,
        "t": "choice",
        "l": {"l-en": "Cost"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "C1"
      },
      {
        "d": {"l-en": "Comments on the conditions of use of this learning object.\n"},
        "i": "1.13",
        "voc": "1.13",
        "min": 1,
        "t": "choice",
        "l": {"l-en": "Copyright and Other Restrictions*"},
        "max": 1,
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "Y2"
      },
      {
        "i": "1.14",
        "min": 0,
        "t": "text",
        "l": {"l-en": "Copyright Description"},
        "max": 1,
        "pref": 1,
        "s": ["TextFormItem"],
        "v": "A"
      },
      {
        "i": "1.15",
        "voc": "1.15",
        "min": 0,
        "t": "choice",
        "l": {"l": "Ontology Term"},
        "pref": 1,
        "s": ["ChoiceFormItem"],
        "v": "AR"
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