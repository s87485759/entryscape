{"languages": {
	"no_select":{"label": "Language"}, 		
	"en": {"en": "English", "sv": "Engelska", "de": "English", "fr": "Anglais", "es": "Inglés", "it": "Inglese", "gr": "Αγγλικά"},
	"et": {"et":"Eesti", "sv": "Estländska", "en": "Estonian"},
	"de": {"de":"Deutsch", "en": "German", "sv": "Tyska", "fr": "Allemand", "es": "Alemán", "it": "Tedesco", "gr": "ερμανικά"},
	"el": {"el":"Ελληνικά", "en": "Greek", "sv": "Grekiska"},
	"hu": {"hu":"Magyar", "en": "Hungarian", "sv": "Ungerska"},
	"no-nb": {"no-nb":"Norsk (bokmål)"},
	"ro": {"ro":"Română", "en": "Romanian", "sv": "Svenska"},
	"ru": {"ru":"Русский", "en": "Russian", "sv": "Ryska"},
	"es": {"es":"Español", "en": "Spanish", "sv": "Spanska", "de": "Spanich", "fr": "Espagnol", "it": "Spagnolo", "gr": "Ισπανικά"},
	"sv": {"sv": "Svenska", "en": "Swedish", "de": "Swedish", "fr": "Suédois", "es": "Sueco", "it": "Svedese", "gr": "Σουηδικά"}
  },
  "namespaces": {
	"telmap": "http://purl.org/telmap/"
  },
  "applicationTypes-NR": {
  },
  "applicationTypes-IR": {
	"telmap:ProjectAspects": {"en":"TEL-Map Project Aspects"},
  },
  "mimeTypes": {
	"application/x-shockwave-flash": {"en": "Application: Flash"},
	"application/x-silverlight": {"en": "Application: Silverlight"},
	"application/rar": {"en": "Archive: RAR"},
    "application/x-tar-gz": {"en": "Archive: TGZ"},
    "application/zip": {"en": "Archive: ZIP"},
    "audio/mpeg": {"en": "Audio: MP3"},
    "audio/ogg": {"en": "Audio: OGG"},
	"text/html": {"en": "Document: HTML"},
	"text/html+snippet": {"en": "Document: HTML Snippet"},
	"application/pdf": {"en": "Document: PDF"},
    "text/plain": {"en": "Document: Plain Text"},
    "application/rtf": {"en": "Document: RTF"},
    "application/atom+xml": {"en": "Feed: Atom"},
    "application/rss+xml": {"en": "Feed: RSS"},
    "image/bmp": {"en": "Image: BMP"},
    "image/gif": {"en": "Image: GIF"},
    "image/jpeg": {"en": "Image: JPEG"},
    "image/svg+xml": {"en": "Image: SVG"},
    "image/png": {"en": "Image: PNG"},
    "application/msexcel": {"en": "Microsoft Excel"},
    "application/mspowerpoint": {"en": "Microsoft PowerPoint"},
    "application/msword": {"en": "Microsoft Word"},
    "application/vnd.oasis.opendocument.graphics": {"en": "OpenOffice.org Graphics"},
    "application/vnd.oasis.opendocument.presentation": {"en": "OpenOffice.org Presentation"},
    "application/vnd.oasis.opendocument.spreadsheet": {"en": "OpenOffice.org Spreadsheet"},
    "application/vnd.oasis.opendocument.text": {"en": "OpenOffice.org Text"},
    "video/msvideo": {"en": "Video: AVI"},
    "video/mpeg": {"en": "Video: MPEG"},
    "video/mp4": {"en": "Video: MP4"},
    "video/ogg": {"en": "Video: OGG"},
    "video/quicktime": {"en": "Video: Quicktime"},
    "video/x-ms-wmv": {"en": "Video: WMV"}
  },
  "MPLanguages": [{"value": "", label:{"en":"", "sv":""}},
		{"value": "en", label:{"en":"English", "sv":"Engelska"}},
		{"value": "de", label:{"en":"German", "sv":"Tyska"}},
		{"value": "fr", label:{"en":"French", "sv":"Franska"}},
		{"value": "es", label:{"en":"Spanish", "sv":"Spanska"}},
		{"value": "sv", label:{"en":"Swedish", "sv":"Svenska"}}],
  "MPMap-localMetadata": {
 	"defaultMP": "rformForFolders",
	"BT": {
		"CONTEXT": "rformForFolders",
		"SYSTEM_CONTEXT": "rformForFolders",
		"USER": "FOAF_User",
		"GROUP": "FOAF_Group",
		"LIST": "rformForFolders",
		"RESULT_LIST": "rformForFolders"
	},
	"AT": {
		"http://purl.org/telmap/ProjectAspects": "TELMAP_PA_v1"
	},
	"MT": {
	}		
  },
  "MPMap-externalMetadata": {
  	"internalReferenceMP": "rformForFolders",
  	"defaultMP": "DC_Simple"
  },
/*  "MPName2Id" :{
	"LOM_OEv1": {"id": "http://rforms.confolio.org/formulator/formlet/OELOM", "mandatoryFields": true},
	"FOAF_Group": {"url": "http://rforms.confolio.org/formulator/formlet/SCAMFOAFGroup"},
	"FOAF_User": {"url": "http://rforms.confolio.org/formulator/formlet/myfoaf"},
	"DCTerms_Minimal": {"url": "http://rforms.confolio.org/formulator/formlet/FolderAP"},
	"DC_Simple": {"items": ["http://purl.org/dc/terms/title", "http://purl.org/dc/terms/description"]}
  },*/
   "MPName2Id" :{
	"LOM_OEv1": {"items": ["LOM-hnet", "http://xmlns.com/foaf/0.1/gender"]},
	"FOAF_Group": {"items": ["http://purl.org/dc/terms/title", "http://purl.org/dc/terms/description"]},
	"FOAF_User": {"items": ["http://purl.org/dc/terms/title", "http://purl.org/dc/terms/description"]},
	"DCTerms_Minimal": {"items": ["http://purl.org/dc/terms/title", "http://purl.org/dc/terms/description"]},
	"DC_Simple": {"items": ["http://purl.org/dc/terms/title", "http://purl.org/dc/terms/description"]},
	"TELMAP_PA_v1": {"items": ["http://purl.org/telmap/ProjectAspects"]},
	"rformForFolders": {"items": ["rformForFolders"]}
  },
  "rformItems": [
      {url: "rforms/telmap.json", type: "sirff"},
	  {url: "rforms/dc-exhibit.json", type: "exhibit"}, 
	  {url: "rforms/foaf-exhibit.json", type: "exhibit"}, 
	  {url: "rforms/LOM-hnet.json", type: "sirff"},
	  {url: "rforms/Europeana.json", type: "sirff"},
	  {url: "rforms/FolderRform.json", type: "sirff"}
  ]
}
