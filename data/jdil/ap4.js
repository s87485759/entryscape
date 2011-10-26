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
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MarketingIssue",
        "l": "MarketingIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DirectMarketing"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MarketTrends"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Nitrogen",
        "l": "Nitrogen"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiminutionOfHumus",
        "l": "DiminutionOfHumus"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodIssue",
        "l": "FoodIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodQuality"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalFood"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ShelfLife"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodSafety"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HACCP"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodAvailability"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodProcessing"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodHealth"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FieldCropsCultivation",
        "l": "FieldCropsCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmingMethod",
        "l": "FarmingMethod",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ExtensiveFarming"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LowInputAgriculture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#TraditionalFarming"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeFarming"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ExtensiveGrazing"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EUOrganicStandard",
        "l": "EUOrganicStandard"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Beer",
        "l": "Beer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#QualityPerception",
        "l": "QualityPerception"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalBreeds",
        "l": "LocalBreeds"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ShelfLife",
        "l": "ShelfLife"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GeneticResistence",
        "l": "GeneticResistence"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CertificationProcess",
        "l": "CertificationProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MeatProductionProcess",
        "l": "MeatProductionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicConversion",
        "l": "OrganicConversion"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Polyculture",
        "l": "Polyculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Corn",
        "l": "Corn"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Entity",
        "l": "Entity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#JuridicalPerson"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalPerson"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Biosolids",
        "l": "Biosolids"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RabbitMeat",
        "l": "RabbitMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChemicallyOrganicFertilizer",
        "l": "ChemicallyOrganicFertilizer",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Compost"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Manure"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GreenManure"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalManure"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Urea"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProcessingIssue",
        "l": "ProcessingIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PreStorage"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Storage"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PreCooling"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PostHarvestHandling"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilHusbandry",
        "l": "SoilHusbandry"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActionResearch",
        "l": "ActionResearch"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalTransport",
        "l": "AnimalTransport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#TraditionalFarming",
        "l": "TraditionalFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MilkProduction",
        "l": "MilkProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunityService",
        "l": "CommunityService"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnvironmentalImpact",
        "l": "EnvironmentalImpact"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductIntegrity",
        "l": "ProductIntegrity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MarketTrends",
        "l": "MarketTrends"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Teaching",
        "l": "Teaching"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sustainability",
        "l": "Sustainability"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilDegradation",
        "l": "SoilDegradation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Issue",
        "l": "Issue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MarketingIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnvironmentIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LearningIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#IdeologyIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DistributionIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#TransportIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProcessingIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HealthIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductionIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConsumptionIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WasteManagementIssue"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Wool",
        "l": "Wool"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DistributionIssue",
        "l": "DistributionIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeDistribution"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunitySupportedAgriculture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmersMarket"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsImport"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmSale"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodShed"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsExport"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalFood",
        "l": "NaturalFood"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LowInputAgriculture",
        "l": "LowInputAgriculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Salt",
        "l": "Salt"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropEcology",
        "l": "CropEcology"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilHealth",
        "l": "SoilHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Consumer",
        "l": "Consumer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HerbCultivation",
        "l": "HerbCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Hamburger",
        "l": "Hamburger"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Milk",
        "l": "Milk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MilkProductionProcess",
        "l": "MilkProductionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Tofu",
        "l": "Tofu"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalProductionActivity",
        "l": "AnimalProductionActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EggProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FishFarming"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AquaCulture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalHusbandry"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MilkProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ShellAquaculture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalProductionDerivedActivity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LeatherProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FeatherProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MeatProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Apiculture"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProcessedProduct",
        "l": "ProcessedProduct",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Leather"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Hamburger"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Cheese"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fodder"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoyaDrink"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Tofu"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sausage"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Dairy"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Beer"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PoultryMeat",
        "l": "PoultryMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Accreditation",
        "l": "Accreditation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MethodOrTechnique",
        "l": "MethodOrTechnique",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Certification"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmingMethod"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AgriculturalPractice"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MultiCropping",
        "l": "MultiCropping"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Concepts",
        "top": true,
        "l": "Concepts",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Issue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Entity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActivityType"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Regulation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MethodOrTechnique"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Process"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Product"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FishFarming",
        "l": "FishFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilTillage",
        "l": "SoilTillage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmSale",
        "l": "FarmSale"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PastureManagement",
        "l": "PastureManagement"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeDistribution",
        "l": "AlternativeDistribution"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WeedControl",
        "l": "WeedControl"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FruitProduction",
        "l": "FruitProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductionIssue",
        "l": "ProductionIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProductionIssue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunitySupportedAgriculture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalResources"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductIntegrity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GMOAvoidance"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalProductionIssue"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SlaughterHouseWaste",
        "l": "SlaughterHouseWaste"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConsumptionIssue",
        "l": "ConsumptionIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AgroFoodSystem"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConsumerAttitudes"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#QualityPerception"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LambMeat",
        "l": "LambMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Cereal",
        "l": "Cereal",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Barley"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Corn"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Wheat"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Dairy",
        "l": "Dairy"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SheepMilk",
        "l": "SheepMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilStructure",
        "l": "SoilStructure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fertilizer",
        "l": "Fertilizer",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChemicallyInorganicFertilizer"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChemicallyOrganicFertilizer"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GreenCare",
        "l": "GreenCare"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sterilization",
        "l": "Sterilization"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fermentation",
        "l": "Fermentation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EggProduction",
        "l": "EggProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ExtensiveFarming",
        "l": "ExtensiveFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChileanSaltpeter",
        "l": "ChileanSaltpeter"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodProcessing",
        "l": "FoodProcessing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Viticulture",
        "l": "Viticulture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sowing",
        "l": "Sowing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Breeding",
        "l": "Breeding"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalOriginProduct",
        "l": "AnimalOriginProduct",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SheepMilk"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChickenMeat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GoatMilk"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Milk"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RabbitMeat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Wool"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Feather"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PoultryMeat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CowMilk"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Jelly"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PigMeat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Meat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LambMeat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CattleMeat"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#BuffaloMilk"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Honey"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WasteManagementIssue",
        "l": "WasteManagementIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Biosolids"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SlaughterHouseWaste"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConsumerAttitudes",
        "l": "ConsumerAttitudes"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnergyEfficiency",
        "l": "EnergyEfficiency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Standard",
        "l": "Standard",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicStandard"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EUOrganicStandard"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GMOAvoidance",
        "l": "GMOAvoidance"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalBehaviour",
        "l": "NaturalBehaviour"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProtection",
        "l": "PlantProtection"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnvironmentIssue",
        "l": "EnvironmentIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sustainability"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CO2Miles"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WaterQuality"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Biodiversity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CarbonSequestration"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EcologicalFootprint"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Pollution"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ClimateChangeMitigation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnvironmentalImpact"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CulturalLandscapes"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RenewevableResources"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ISO14000Program"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnergyEfficiency"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Permaculture",
        "l": "Permaculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CompanionPlanting",
        "l": "CompanionPlanting"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeCrops",
        "l": "AlternativeCrops"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalHusbandry",
        "l": "AnimalHusbandry"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActivityType",
        "l": "ActivityType",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalProductionActivity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProductionActivity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NonProductiveActivity"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalResources",
        "l": "LocalResources"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Research",
        "l": "Research"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilCompaction",
        "l": "SoilCompaction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Feather",
        "l": "Feather"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ExtensiveGrazing",
        "l": "ExtensiveGrazing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Urea",
        "l": "Urea"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Leather",
        "l": "Leather"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Certification",
        "l": "Certification",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EUOrganicCertification"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicCertification"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GreenManure",
        "l": "GreenManure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NutrientDeficiency",
        "l": "NutrientDeficiency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicStandard",
        "l": "OrganicStandard"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsExport",
        "l": "ProductsExport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalProduction",
        "l": "LocalProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#JuridicalPerson",
        "l": "JuridicalPerson",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RegulatoryAgency"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Farm"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CertificationAgency"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Producer"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#VegetableOriginProduct",
        "l": "VegetableOriginProduct",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropResidue"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Cereal"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Ecoturism",
        "l": "Ecoturism"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LivestockHousing",
        "l": "LivestockHousing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CertificationAgency",
        "l": "CertificationAgency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RuralLivelihoods",
        "l": "RuralLivelihoods"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodShed",
        "l": "FoodShed"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Producer",
        "l": "Producer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EcologicalFootprint",
        "l": "EcologicalFootprint"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiseasesPrevention",
        "l": "DiseasesPrevention"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantHealth",
        "l": "PlantHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropResidue",
        "l": "CropResidue"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HealthIssue",
        "l": "HealthIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalHealth"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WellBeing"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantHealth"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProductionDerivedActivity",
        "l": "PlantProductionDerivedActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WeedControl"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilTillage"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Plowing"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sowing"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fertilization"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PestControl"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fodder",
        "l": "Fodder"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#N-Fixation",
        "l": "N-Fixation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CattleMeat",
        "l": "CattleMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicCertification",
        "l": "OrganicCertification"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalProductionIssue",
        "l": "AnimalProductionIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#BeeOrigin"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LocalBreeds"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalNutrition"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FodderPreference"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OutdoorKeeping"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Diet"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalBehaviour"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislationOnOrganicFertilizers",
        "l": "EULegislationOnOrganicFertilizers"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FodderManagement",
        "l": "FodderManagement"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicPrinciple",
        "l": "OrganicPrinciple"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChickenMeat",
        "l": "ChickenMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WaterQuality",
        "l": "WaterQuality"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ShellAquaculture",
        "l": "ShellAquaculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Diet",
        "l": "Diet"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#BeeOrigin",
        "l": "BeeOrigin"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalPerson",
        "l": "NaturalPerson",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LandOwner"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Consumer"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Distributor"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Farmer"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropRotation",
        "l": "CropRotation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LandOwner",
        "l": "LandOwner"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodHealth",
        "l": "FoodHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Regulation",
        "l": "Regulation",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LabelingRegulation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Legislation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Standard"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FodderPreference",
        "l": "FodderPreference"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Distributor",
        "l": "Distributor"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RenewevableResources",
        "l": "RenewevableResources"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Product",
        "l": "Product",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#UnprocessedProduct"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fertilizer"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProcessedProduct"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#IdeologyIssue",
        "l": "IdeologyIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicPrinciple"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalWelfare"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Permaculture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PovertyAlleviation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RuralLivelihoods"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#IFOAMPrinciples"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalEthics"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LearningIssue",
        "l": "LearningIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActionLearning"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActionResearch"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Potassium",
        "l": "Potassium"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalProductionDerivedActivity",
        "l": "AnimalProductionDerivedActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FodderManagement"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiseasesTreatment"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LivestockHousing"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Breeding"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiseasesPrevention"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MeatProduction",
        "l": "MeatProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ClimateChangeMitigation",
        "l": "ClimateChangeMitigation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Barley",
        "l": "Barley"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunitySupportedAgriculture",
        "l": "CommunitySupportedAgriculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilBiology",
        "l": "SoilBiology"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantNutrition",
        "l": "PlantNutrition"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NaturalNutrition",
        "l": "NaturalNutrition"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Training",
        "l": "Training"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Honey",
        "l": "Honey"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#RegulatoryAgency",
        "l": "RegulatoryAgency"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ServiceOrientedActivity",
        "l": "ServiceOrientedActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Ecoturism"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CommunityService"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GreenCare"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#UnprocessedProduct",
        "l": "UnprocessedProduct",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#VegetableOriginProduct"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalOriginProduct"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChemicalCompound"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ActionLearning",
        "l": "ActionLearning"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AgroFoodSystem",
        "l": "AgroFoodSystem"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsImport",
        "l": "ProductsImport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#IFOAMPrinciples",
        "l": "IFOAMPrinciples"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Process",
        "l": "Process",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CertificationProcess"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicConversion"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Accreditation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductionProcess"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sterilization"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiseasesTreatment",
        "l": "DiseasesTreatment"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChemicallyInorganicFertilizer",
        "l": "ChemicallyInorganicFertilizer",
        "children": [{"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChileanSaltpeter"}],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilIssue",
        "l": "SoilIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NutrientRecycling"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilDegradation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConversionProcess"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DiminutionOfHumus"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilStructure"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilCompaction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Humus"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilHusbandry"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilFertility"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilAcidification"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicMatter"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilBiology"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilHealth"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#N-Fixation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilConservation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NutrientDeficiency"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilbiologicalActivity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilErosion"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodSafety",
        "l": "FoodSafety"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WineProductionProcess",
        "l": "WineProductionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CerealsCultivation",
        "l": "CerealsCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Phosphorus",
        "l": "Phosphorus"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilbiologicalActivity",
        "l": "SoilbiologicalActivity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ISO14000Program",
        "l": "ISO14000Program"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProductionActivity",
        "l": "PlantProductionActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FruitProduction"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AquaCulture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProductionDerivedActivity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Viticulture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilessCulture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnergyCropsCultivation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CerealsCultivation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FieldCropsCultivation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HerbCultivation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Polyculture"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PastureManagement"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Sausage",
        "l": "Sausage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AgriculturalPractice",
        "l": "AgriculturalPractice",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CompanionPlanting"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropRotation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#InterCropping"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MultiCropping"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsTransport",
        "l": "ProductsTransport"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FarmersMarket",
        "l": "FarmersMarket"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FeatherProduction",
        "l": "FeatherProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LeatherProduction",
        "l": "LeatherProduction"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductionProcess",
        "l": "ProductionProcess",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WineProductionProcess"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MilkProductionProcess"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#MeatProductionProcess"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fermentation"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#DirectMarketing",
        "l": "DirectMarketing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilFertility",
        "l": "SoilFertility"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalHealth",
        "l": "AnimalHealth"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Storage",
        "l": "Storage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PigMeat",
        "l": "PigMeat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PovertyAlleviation",
        "l": "PovertyAlleviation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoyaDrink",
        "l": "SoyaDrink"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Meat",
        "l": "Meat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Legislation",
        "l": "Legislation",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislationOnGMO"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislation"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislationOnOrganicFertilizers"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#BuffaloMilk",
        "l": "BuffaloMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OutdoorKeeping",
        "l": "OutdoorKeeping"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChemicalCompound",
        "l": "ChemicalCompound",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Salt"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Nitrogen"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ChileanSaltpeter"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Potassium"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Phosphorus"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Urea"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AquaCulture",
        "l-en": "aquaculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodAvailability",
        "l": "FoodAvailability"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Plowing",
        "l": "Plowing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilessCulture",
        "l": "SoilessCulture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Diversity",
        "l": "Diversity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalManure",
        "l": "AnimalManure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#FoodQuality",
        "l": "FoodQuality"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Humus",
        "l": "Humus"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Compost",
        "l": "Compost"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Cheese",
        "l": "Cheese"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Jelly",
        "l": "Jelly"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PreCooling",
        "l": "PreCooling"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Farmer",
        "l": "Farmer"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalEthics",
        "l": "AnimalEthics"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NonProductiveActivity",
        "l": "NonProductiveActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ServiceOrientedActivity"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EducationActivity"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Learning",
        "l": "Learning"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GoatMilk",
        "l": "GoatMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Fertilization",
        "l": "Fertilization"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PestControl",
        "l": "PestControl"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Pollution",
        "l": "Pollution"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#TransportIssue",
        "l": "TransportIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalTransport"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ProductsTransport"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#WellBeing",
        "l": "WellBeing"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#LabelingRegulation",
        "l": "LabelingRegulation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProductionIssue",
        "l": "PlantProductionIssue",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantProtection"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#GeneticResistence"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeCrops"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CropEcology"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PlantNutrition"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Diversity"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PreStorage",
        "l": "PreStorage"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AlternativeFarming",
        "l": "AlternativeFarming"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#HACCP",
        "l": "HACCP"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EducationActivity",
        "l": "EducationActivity",
        "children": [
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Teaching"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Learning"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Research"},
          {"_reference": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Training"}
        ],
        "selectable": false
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Apiculture",
        "l": "Apiculture"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#NutrientRecycling",
        "l": "NutrientRecycling"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislationOnGMO",
        "l": "EULegislationOnGMO"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Manure",
        "l": "Manure"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Biodiversity",
        "l": "Biodiversity"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EULegislation",
        "l": "EULegislation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Wheat",
        "l": "Wheat"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CowMilk",
        "l": "CowMilk"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilAcidification",
        "l": "SoilAcidification"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#Farm",
        "l": "Farm"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#OrganicMatter",
        "l": "OrganicMatter"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EnergyCropsCultivation",
        "l": "EnergyCropsCultivation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CulturalLandscapes",
        "l": "CulturalLandscapes"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilErosion",
        "l": "SoilErosion"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CO2Miles",
        "l": "CO2Miles"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#EUOrganicCertification",
        "l": "EUOrganicCertification"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#ConversionProcess",
        "l": "ConversionProcess"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#InterCropping",
        "l-en": "intercropping"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#CarbonSequestration",
        "l": "CarbonSequestration"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#AnimalWelfare",
        "l": "AnimalWelfare"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#SoilConservation",
        "l": "SoilConservation"
      },
      {
        "d": "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#PostHarvestHandling",
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
        "pref": 0,
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
        "s": [
          "ExpandableTree",
          "ChoiceFormItem"
        ],
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
