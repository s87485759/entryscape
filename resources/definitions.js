define({
    "localizedTo": ["en", "sv"],
    "inputLanguages": ["en", "sv", "de", "fr", "es", "no"],

    "specialIcons": {
        "link": {"base": "resources/icons/oxygen/", "filename": "link.png"},
        "RSS":  {"base": "resources/icons/oxygen/", "filename": "RSS.png", "16x16": true},
        "portfolio": {"base": "resources/icons/oxygen/", "filename": "book.png"},
        "folder": {"base": "resources/icons/oxygen/", "filename": "folder.png"},
        "user": {"base": "resources/icons/oxygen/", "filename": "user.png", "16x16": true},
        "group": {"base": "resources/icons/oxygen/", "filename": "users2.png", "16x16": true},
        "user_picture_frame": {"base": "resources/icons/oxygen/", "filename": "picture_frame.png"},
        "group_picture_frame": {"base": "resources/icons/oxygen/", "filename": "picture_frame_users.png"},
        "pushpin": {"base": "resources/icons/oxygen/", "filename": "pushpin.png", "22x22": true},
        "pushpin_pressed": {"base": "resources/icons/oxygen/", "filename": "pushpin-pressed.png", "22x22": true},
        "logo": {"base": "resources/icons/logo/", "filename": "entryscape.png"},
        "openid-google": {"base": "resources/icons/logo/", "filename": "google.png"},
        "openid-yahoo": {"base": "resources/icons/logo/", "filename": "yahoo.png"}
    },

    "languages": {
        "":{"label": "Language"},
        "en": {"en": "English", "sv": "Engelska", "de": "English", "fr": "Anglais", "es": "Inglés", "it": "Inglese", "gr": "Αγγλικά"},
        "et": {"et":"Eesti", "sv": "Estländska", "en": "Estonian"},
        "de": {"de":"Deutsch", "en": "German", "sv": "Tyska", "fr": "Allemand", "es": "Alemán", "it": "Tedesco", "gr": "ερμανικά"},
        "el": {"el":"Ελληνικά", "en": "Greek", "sv": "Grekiska"},
        "hu": {"hu":"Magyar", "en": "Hungarian", "sv": "Ungerska"},
        "no-nb": {"no-nb":"Norsk (bokmål)"},
        "ro": {"ro":"Română", "en": "Romanian", "sv": "Svenska"},
        "fr": {"en":"French", "sv":"Franska"},
        "ru": {"ru":"Русский", "en": "Russian", "sv": "Ryska"},
        "es": {"es":"Español", "en": "Spanish", "sv": "Spanska", "de": "Spanich", "fr": "Espagnol", "it": "Spagnolo", "gr": "Ισπανικά"},
        "sv": {"sv": "Svenska", "en": "Swedish", "de": "Swedish", "fr": "Suédois", "es": "Sueco", "it": "Svedese", "gr": "Σουηδικά"}
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

    "namespaces": {
        "dct": "http://purl.org/dc/dcmitype/",
        "esc": "http://entryscape.org/terms/",
        "rev": "http://purl.org/stuff/rev#"
    },

    "defaults": {
        "icon": {"base": "resources/icons/oxygen/", "filename": "unknown.png"},
        "template": ["entryscape:dcterms-medium"],
        "labelTemplate": "dcterms:title"
    },

    "applictionTypeSets": [
        {
            "typeSetCommon": {
                "template": ["entryscape:dcterms-medium"],
                "labeltemplate": "dcterms:title",
                "artifact": false,
                "link": true,
                "file": true,
                "advanced": false
            },
            "types": [
                {
                    "uri": "dct:Sound",
                    "label": {"en":"Audio", "el":"Ήχος", "no":"Lyd", "ro":"Audio", "hu":"Audio", "es":"Audio", "et":"Audio", "de":"Audio ", "ru":"Aудио"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "audio_basic.png", "16x16": true, "22x22": true, "32x32": true},
                    "extentionHint": ["aif", "iff", "m3u", "m4a", "mid", "mp3", "mpa", "ra", "wav", "wma", "ogg"]
                },
                {
                    "uri": "dct:Dataset",
                    "label": {"en":"Data", "el":"Δεδομένα", "no":"Data", "ro":"Data", "hu":"Adatok", "es":"Datos", "et":"Andmed", "de":"Daten ", "ru":"Данные"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "binary.png", "16x16": true, "22x22": true, "32x32": true},
                    "extentionHint": ["dat", "gbr", "ged", "vcf", "xml"],
                    "advanced": true

                },
                {
                    "uri": "dct:StillImage",
                    "label": {"en":"Image", "el":"εικόνα", "no":"bilde", "ro":"imagine", "hu":"image", "es":"imagen", "et":"image", "de":"bild ", "ru":"изображение"},
                    "icon":  {"base": "resources/icons/oxygen/", "filename": "image.png", "16x16": true, "22x22": true, "32x32": true},
                    "extentionHint": ["3dm", "3ds", "max", "obj", "bmp", "dds", "gif", "jpg", "jpeg", "png", "psd", "pspimage", "tga", "thm", "tif", "tiff", "yuv", "ai", "eps", "ps", "svg", "dxf", "dwg"]
                },
                {
                    "uri": "dct:MovingImage",
                    "label": {"en":"Video", "el":"Βίντεο", "no":"Video", "ro":"Video", "hu":"Videó", "es":"Video", "et":"Video", "de":"Video", "ru":"Видео"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "video.png", "16x16": true, "22x22": true, "32x32": true},
                    "extentionHint": ["3g2", "3gp", "asf", "asx", "avi", "flv", "m4v", "mov", "mp4", "mpg", "rm", "srt", "swf", "vob", "wmv"],
                    "serviceIndicators": ["youtube.com/", "vimeo.com/"]
                },
                {
                    "uri": "esc:Document",
                    "label": {"en":"Document", "sv": "Document"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "text_plain.png", "16x16": true, "22x22": true, "32x32": true},
                    "extentionHint": ["doc", "docx", "log", "msg", "odt", "pages", "rtf", "tex", "txt", "wpd", "wps", "pdf"],
                    "serviceIndicators": ["drive.google.com"]
                },
                {
                    "uri": "dct:BibliographicResource",
                    "label": {"en":"Bibliographic resource", "sv": "Bibliographic resource"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "book.png", "16x16": true},
                    "template": ["dcterms:BibliographicResource"]
                },
                {
                    "uri": "esc:Spreadsheet",
                    "label": {"en":"Spreadsheet", "sv": "Kalkylblad"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "spreadsheet.png", "16x16": true},
                    "extentionHint": ["csv", "xls", "xlsx", "ods", "sdf", "gnumeric"]
                },
                {
                    "uri": "esc:WebContent",
                    "label": {"en":"Web content", "sv": "Webbmaterial"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "html.png", "16x16": true, "22x22": true, "64x64": true},
                    "linkFallback": true
                },
                {
                    "uri": "esc:Presentation",
                    "label": {"en":"Presentation", "sv": "Presentation"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "datashowchart.png", "16x16": true, "22x22": true},
                    "extentionHint": ["odp", "key", "pps", "ppt", "pptx"]
                },
                {
                    "uri": "dct:Event",
                    "label": {"en": "Event"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "calendar.png", "16x16": true, "22x22": true, "32x32": true},
                    "artifact": true,
                    "file": false,
                    "link": false,
                    "advanced": true
                },
                {
                    "uri": "dct:Collection",
                    "label": {"en": "Collection"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "package.png", "16x16": true, "22x22": true, "32x32": true},
                    "extentionHint": ["7z", "cbr", "deb", "gz", "pkg", "rar", "rpm", "sitx", "tar.gz", "zip", "zipx"],
                    "advanced": true
                },
                {
                    "uri": "dct:InteractiveResource",
                    "label": {"en": "Interactive resource"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "media_equalizer.png", "16x16": true},
                    "advanced": true
                },
                {
                    "uri": "dct:PhysicalObject",
                    "label": {"en": "Physical object"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "tool2.png", "16x16": true, "22x22": true, "32x32": true},
                    "artifact": true,
                    "file": false,
                    "link": false,
                    "advanced": true
                },
                {
                    "uri": "rev:Review",
                    "label": {"en": "Review"},
                    "icon": {"base": "resources/icons/dkit/", "filename": "chat_bubble.png", "16x16": true},
                    "template": ["http://purl.org/stuff/rev#Review"],
                    "advanced": true
                },
                {
                    "uri": "esc:Pipeline",
                    "label": {"en": "Pipeline"},
                    "icon": {"base": "resources/icons/oxygen/", "filename": "filter.png", "16x16": true, "64x64": true},
                    "template": ["tr:Pipeline"],
                    "artifact": true,
                    "advanced": true,
                    "resourceType": "Pipeline"
                },
                {
                    "uri": "esc:Graph",
                    "label": {"en": "Graph"},
                    "icon": {"base": "resources/icons/w3c/", "filename": "rdf_flyer.png", "16x16": true, "64x64": true},
                    "artifact": true,
                    "informationresource": true,
                    "advanced": true,
                    "resourceType": "Graph"
                }
            ]
        }
    ],
    "graphTypes": {
        "CONTEXT": {"icon": {"base": "resources/icons/oxygen/", "filename": "book.png", "16x16": true}},
        "SYSTEM_CONTEXT": {"icon": {"base": "resources/icons/oxygen/", "filename": "book2.png"}},
        "USER": {
            "template": ["foaf:Person"],
            "labelTemplate": "foaf:name",
            "icon": {"base": "resources/icons/oxygen/", "filename": "user.png", "16x16": true}
        },
        "GROUP": {
            "template": ["entryscape:foaf-group"],
            "labelTemplate": "foaf:name",
            "icon": {"base": "resources/icons/oxygen/", "filename": "users2.png"}
        },
        "LIST": {"icon": {"base": "resources/icons/oxygen/", "filename": "folder.png"}},
        "RESULT_LIST": {"icon": {"base": "resources/icons/oxygen/", "filename": "find.png"}}
    },
    "mediaTypes": {
        "video": 		{"icon": {"base": "resources/icons/oxygen/", "filename": "video.png", "16x16": true, "22x22": true, "32x32": true}},
        "presentation": {"icon": {"base": "resources/icons/oxygen/", "filename": "presentation.png", "16x16": true, "22x22": true, "32x32": true}},
        "image": 		{"icon": {"base": "resources/icons/oxygen/", "filename": "image.png", "16x16": true, "22x22": true, "32x32": true}},
        "images": 		{"icon": {"base": "resources/icons/oxygen/", "filename": "images.png"}},
        "calendar": 	{"icon": {"base": "resources/icons/oxygen/", "filename": "calendar.png", "16x16": true, "22x22": true, "32x32": true}},
        "text": 		{"icon": {"base": "resources/icons/oxygen/", "filename": "text_plain.png", "16x16": true, "22x22": true, "32x32": true}},
        "sound": 		{"icon": {"base": "resources/icons/oxygen/", "filename": "audio_basic.png", "16x16": true, "22x22": true, "32x32": true}}
    },
    "entryTypes": {
        "LINK": 			{"icon": {"base": "resources/icons/oxygen/", "filename": "html.png"}},
        "LINK_REFERENCE": 	{"icon": {"base": "resources/icons/oxygen/", "filename": "html.png"}},
        "REFERENCE": 		{"icon": {"base": "resources/icons/oxygen/", "filename": "html.png"}}
    },
    "comments": [{"class": "http://purl.org/stuff/rev#Review", "property": "http://ontologi.es/like#regarding"}],

    "templateSources": [
        "resources/rforms/EntryScape.json",
        "resources/rforms/dcterms.json",
        "resources/rforms/dc.json",
        "resources/rforms/foaf.json",
        "resources/rforms/Review.json",
        "resources/rforms/transform.json"
    ]
})