define({
 "auxilliary": [
  {
   "id": "foaf:mbox",
   "property": "http://xmlns.com/foaf/0.1/mbox",
   "label": {
    "en": "personal mailbox"
   },
   "description": {
    "en": "A \npersonal mailbox, ie. an Internet mailbox associated with exactly one owner, the first owner of this mailbox. This is a 'static inverse functional property', in that  there is (across time and change) at most one individual that ever has any particular value for foaf:mbox."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:mbox_sha1sum",
   "property": "http://xmlns.com/foaf/0.1/mbox_sha1sum",
   "label": {
    "en": "sha1sum of a personal mailbox URI name"
   },
   "description": {
    "en": "The sha1sum of the URI of an Internet mailbox associated with exactly one owner, the  first owner of the mailbox."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:gender",
   "property": "http://xmlns.com/foaf/0.1/gender",
   "label": {
    "en": "gender"
   },
   "description": {
    "en": "The gender of this Agent (typically but not necessarily 'male' or 'female')."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:sha1",
   "property": "http://xmlns.com/foaf/0.1/sha1",
   "label": {
    "en": "sha1sum (hex)"
   },
   "description": {
    "en": "A sha1sum hash, in hex."
   },
   "type": "group",
   "automatic": true,
   "content": []
  },
  {
   "id": "foaf:based_near",
   "property": "http://xmlns.com/foaf/0.1/based_near",
   "label": {
    "en": "based near"
   },
   "description": {
    "en": "A location that something is based near, for some broadly human notion of near."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing"
   },
   "type": "group",
   "automatic": true,
   "content": [
    {
     "id": "foaf:based_near"
    },
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:maker"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:logo"
    },
    {
     "id": "foaf:isPrimaryTopicOf"
    },
    {
     "id": "foaf:page"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:openid"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:tipjar"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:openid"
    },
    {
     "id": "foaf:isPrimaryTopicOf"
    }
   ]
  },
  {
   "id": "foaf:title",
   "property": "http://xmlns.com/foaf/0.1/title",
   "label": {
    "en": "title"
   },
   "description": {
    "en": "Title (Mr, Mrs, Ms, Dr. etc)"
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:nick",
   "property": "http://xmlns.com/foaf/0.1/nick",
   "label": {
    "en": "nickname"
   },
   "description": {
    "en": "A short informal nickname characterising an agent (includes login identifiers, IRC and other chat nicknames)."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:jabberID",
   "property": "http://xmlns.com/foaf/0.1/jabberID",
   "label": {
    "en": "jabber ID"
   },
   "description": {
    "en": "A jabber ID for something."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:aimChatID",
   "property": "http://xmlns.com/foaf/0.1/aimChatID",
   "label": {
    "en": "AIM chat ID"
   },
   "description": {
    "en": "An AIM chat ID"
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:skypeID",
   "property": "http://xmlns.com/foaf/0.1/skypeID",
   "label": {
    "en": "Skype ID"
   },
   "description": {
    "en": "A Skype ID"
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:icqChatID",
   "property": "http://xmlns.com/foaf/0.1/icqChatID",
   "label": {
    "en": "ICQ chat ID"
   },
   "description": {
    "en": "An ICQ chat ID"
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:yahooChatID",
   "property": "http://xmlns.com/foaf/0.1/yahooChatID",
   "label": {
    "en": "Yahoo chat ID"
   },
   "description": {
    "en": "A Yahoo chat ID"
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:msnChatID",
   "property": "http://xmlns.com/foaf/0.1/msnChatID",
   "label": {
    "en": "MSN chat ID"
   },
   "description": {
    "en": "An MSN chat ID"
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:name",
   "property": "http://xmlns.com/foaf/0.1/name",
   "label": {
    "en": "name"
   },
   "description": {
    "en": "A name for some thing."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:firstName",
   "property": "http://xmlns.com/foaf/0.1/firstName",
   "label": {
    "en": "firstName"
   },
   "description": {
    "en": "The first name of a person."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:lastName",
   "property": "http://xmlns.com/foaf/0.1/lastName",
   "label": {
    "en": "lastName"
   },
   "description": {
    "en": "The last name of a person."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:givenName",
   "property": "http://xmlns.com/foaf/0.1/givenName",
   "label": {
    "en": "Given name"
   },
   "description": {
    "en": "The given name of some person."
   },
   "type": "group",
   "automatic": true,
   "content": []
  },
  {
   "id": "foaf:familyName",
   "property": "http://xmlns.com/foaf/0.1/familyName",
   "label": {
    "en": "familyName"
   },
   "description": {
    "en": "The family name of some person."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:phone",
   "property": "http://xmlns.com/foaf/0.1/phone",
   "label": {
    "en": "phone"
   },
   "description": {
    "en": "A phone,  specified using fully qualified tel: URI scheme (refs: http://www.w3.org/Addressing/schemes.html#tel)."
   },
   "type": "group",
   "automatic": true,
   "content": []
  },
  {
   "id": "foaf:homepage",
   "property": "http://xmlns.com/foaf/0.1/homepage",
   "label": {
    "en": "homepage"
   },
   "description": {
    "en": "A homepage for some thing."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:weblog",
   "property": "http://xmlns.com/foaf/0.1/weblog",
   "label": {
    "en": "weblog"
   },
   "description": {
    "en": "A weblog of some thing (whether person, group, company etc.)."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:openid",
   "property": "http://xmlns.com/foaf/0.1/openid",
   "label": {
    "en": "openid"
   },
   "description": {
    "en": "An OpenID for an Agent."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:tipjar",
   "property": "http://xmlns.com/foaf/0.1/tipjar",
   "label": {
    "en": "tipjar"
   },
   "description": {
    "en": "A tipjar document for this agent, describing means for payment and reward."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:plan",
   "property": "http://xmlns.com/foaf/0.1/plan",
   "label": {
    "en": "plan"
   },
   "description": {
    "en": "A .plan comment, in the tradition of finger and '.plan' files."
   },
   "type": "text",
   "nodetype": "LANGUAGE_LITERAL",
   "cls": [
    "rformsmultiline"
   ],
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:made",
   "property": "http://xmlns.com/foaf/0.1/made",
   "label": {
    "en": "made"
   },
   "description": {
    "en": "Something that was made by this agent."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:maker",
   "property": "http://xmlns.com/foaf/0.1/maker",
   "label": {
    "en": "maker"
   },
   "description": {
    "en": "An agent that \nmade this thing."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Agent"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:img",
   "property": "http://xmlns.com/foaf/0.1/img",
   "label": {
    "en": "image"
   },
   "description": {
    "en": "An image that can be used to represent some thing (ie. those depictions which are particularly representative of something, eg. one's photo on a homepage)."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:depiction",
   "property": "http://xmlns.com/foaf/0.1/depiction",
   "label": {
    "en": "depiction"
   },
   "description": {
    "en": "A depiction of some thing."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Image"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:depicts",
   "property": "http://xmlns.com/foaf/0.1/depicts",
   "label": {
    "en": "depicts"
   },
   "description": {
    "en": "A thing depicted in this representation."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:thumbnail",
   "property": "http://xmlns.com/foaf/0.1/thumbnail",
   "label": {
    "en": "thumbnail"
   },
   "description": {
    "en": "A derived thumbnail image."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Image"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:myersBriggs",
   "property": "http://xmlns.com/foaf/0.1/myersBriggs",
   "label": {
    "en": "myersBriggs"
   },
   "description": {
    "en": "A Myers Briggs (MBTI) personality classification."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:workplaceHomepage",
   "property": "http://xmlns.com/foaf/0.1/workplaceHomepage",
   "label": {
    "en": "workplace homepage"
   },
   "description": {
    "en": "A workplace homepage of some person; the homepage of an organization they work for."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:workInfoHomepage",
   "property": "http://xmlns.com/foaf/0.1/workInfoHomepage",
   "label": {
    "en": "work info homepage"
   },
   "description": {
    "en": "A work info homepage of some person; a page about their work for some organization."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:schoolHomepage",
   "property": "http://xmlns.com/foaf/0.1/schoolHomepage",
   "label": {
    "en": "schoolHomepage"
   },
   "description": {
    "en": "A homepage of a school attended by the person."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:knows",
   "property": "http://xmlns.com/foaf/0.1/knows",
   "label": {
    "en": "knows"
   },
   "description": {
    "en": "A person known by this person (indicating some level of reciprocated interaction between the parties)."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Person"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:interest",
   "property": "http://xmlns.com/foaf/0.1/interest",
   "label": {
    "en": "interest"
   },
   "description": {
    "en": "A page about a topic of interest to this person."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:topic_interest",
   "property": "http://xmlns.com/foaf/0.1/topic_interest",
   "label": {
    "en": "topic_interest"
   },
   "description": {
    "en": "A thing of interest to this person."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:publications",
   "property": "http://xmlns.com/foaf/0.1/publications",
   "label": {
    "en": "publications"
   },
   "description": {
    "en": "A link to the publications of this person."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:currentProject",
   "property": "http://xmlns.com/foaf/0.1/currentProject",
   "label": {
    "en": "current project"
   },
   "description": {
    "en": "A current project this person works on."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:pastProject",
   "property": "http://xmlns.com/foaf/0.1/pastProject",
   "label": {
    "en": "past project"
   },
   "description": {
    "en": "A project this person has previously worked on."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:logo",
   "property": "http://xmlns.com/foaf/0.1/logo",
   "label": {
    "en": "logo"
   },
   "description": {
    "en": "A logo representing some thing."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:topic",
   "property": "http://xmlns.com/foaf/0.1/topic",
   "label": {
    "en": "topic"
   },
   "description": {
    "en": "A topic of some page or document."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:primaryTopic",
   "property": "http://xmlns.com/foaf/0.1/primaryTopic",
   "label": {
    "en": "primary topic"
   },
   "description": {
    "en": "The primary topic of some page or document."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:focus",
   "property": "http://xmlns.com/foaf/0.1/focus",
   "label": {
    "en": "focus"
   },
   "description": {
    "en": "The underlying or 'focal' entity associated with some SKOS-described concept."
   },
   "type": "text",
   "nodetype": "URI",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:isPrimaryTopicOf",
   "property": "http://xmlns.com/foaf/0.1/isPrimaryTopicOf",
   "label": {
    "en": "is primary topic of"
   },
   "description": {
    "en": "A document that this thing is the primary topic of."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:page",
   "property": "http://xmlns.com/foaf/0.1/page",
   "label": {
    "en": "page"
   },
   "description": {
    "en": "A page or document about this thing."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:account",
   "property": "http://xmlns.com/foaf/0.1/account",
   "label": {
    "en": "account"
   },
   "description": {
    "en": "Indicates an account held by this agent."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/OnlineAccount"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:accountServiceHomepage",
   "property": "http://xmlns.com/foaf/0.1/accountServiceHomepage",
   "label": {
    "en": "account service homepage"
   },
   "description": {
    "en": "Indicates a homepage of the service provide for this online account."
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:accountName",
   "property": "http://xmlns.com/foaf/0.1/accountName",
   "label": {
    "en": "account name"
   },
   "description": {
    "en": "Indicates the name (identifier) associated with this online account."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:member",
   "property": "http://xmlns.com/foaf/0.1/member",
   "label": {
    "en": "member"
   },
   "description": {
    "en": "Indicates a member of a Group"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Agent"
   },
   "type": "choice",
   "nodetype": "RESOURCE",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:membershipClass",
   "property": "http://xmlns.com/foaf/0.1/membershipClass",
   "label": {
    "en": "membershipClass"
   },
   "description": {
    "en": "Indicates the class of individuals that are a member of a Group"
   },
   "type": "group",
   "automatic": true,
   "content": []
  },
  {
   "id": "foaf:birthday",
   "property": "http://xmlns.com/foaf/0.1/birthday",
   "label": {
    "en": "birthday"
   },
   "description": {
    "en": "The birthday of this Agent, represented in mm-dd string form, eg. '12-31'."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:age",
   "property": "http://xmlns.com/foaf/0.1/age",
   "label": {
    "en": "age"
   },
   "description": {
    "en": "The age in years of some agent."
   },
   "type": "text",
   "nodetype": "ONLY_LITERAL",
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "foaf:status",
   "property": "http://xmlns.com/foaf/0.1/status",
   "label": {
    "en": "status"
   },
   "description": {
    "en": "A string expressing what the user is happy for the general public (normally) to know about their current activity."
   },
   "type": "text",
   "nodetype": "LANGUAGE_LITERAL",
   "cls": [
    "rformsmultiline"
   ],
   "cardinality": {
    "pref": 1
   }
  },
  {
   "id": "http://www.w3.org/2000/01/rdf-schema#label",
   "property": "http://www.w3.org/2000/01/rdf-schema#label",
   "label": {
    "en": "rdf-schema#label"
   },
   "type": "group",
   "automatic": true,
   "content": []
  },
  {
   "id": "foaf:LabelProperty",
   "label": {
    "en": "Label Property"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/LabelProperty"
   },
   "description": {
    "en": "A foaf:LabelProperty is any RDF property with texual values that serve as labels."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Person",
   "label": {
    "en": "Person"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Person"
   },
   "description": {
    "en": "A person."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:firstName"
    },
    {
     "id": "foaf:lastName"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:mbox"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:gender"
    },
    {
     "id": "foaf:age"
    },
    {
     "id": "foaf:birthday"
    },
    {
     "id": "foaf:knows"
    },
    {
     "id": "foaf:based_near"
    },
    {
     "id": "foaf:topic_interest"
    },
    {
     "id": "foaf:status"
    },
    {
     "id": "foaf:plan"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:account"
      },
      {
       "id": "foaf:skypeID"
      },
      {
       "id": "foaf:aimChatID"
      },
      {
       "id": "foaf:icqChatID"
      },
      {
       "id": "foaf:msnChatID"
      },
      {
       "id": "foaf:yahooChatID"
      },
      {
       "id": "foaf:jabberID"
      },
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:myersBriggs"
      },
      {
       "id": "foaf:familyName"
      },
      {
       "id": "foaf:interest"
      },
      {
       "id": "foaf:mbox_sha1sum"
      },
      {
       "id": "foaf:made"
      },
      {
       "id": "foaf:pastProject"
      },
      {
       "id": "foaf:currentProject"
      },
      {
       "id": "foaf:publications"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      },
      {
       "id": "foaf:schoolHomepage"
      },
      {
       "id": "foaf:workInfoHomepage"
      },
      {
       "id": "foaf:workplaceHomepage"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Agent",
   "label": {
    "en": "Agent"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Agent"
   },
   "description": {
    "en": "An agent (eg. person, group, software or physical artifact)."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:mbox"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:gender"
    },
    {
     "id": "foaf:age"
    },
    {
     "id": "foaf:birthday"
    },
    {
     "id": "foaf:topic_interest"
    },
    {
     "id": "foaf:status"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:account"
      },
      {
       "id": "foaf:skypeID"
      },
      {
       "id": "foaf:aimChatID"
      },
      {
       "id": "foaf:icqChatID"
      },
      {
       "id": "foaf:msnChatID"
      },
      {
       "id": "foaf:yahooChatID"
      },
      {
       "id": "foaf:jabberID"
      },
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:interest"
      },
      {
       "id": "foaf:mbox_sha1sum"
      },
      {
       "id": "foaf:made"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Document",
   "label": {
    "en": "Document"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
   },
   "description": {
    "en": "A document."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:primaryTopic"
    },
    {
     "id": "foaf:topic"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      },
      {
       "id": "foaf:sha1"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Organization",
   "label": {
    "en": "Organization"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Organization"
   },
   "description": {
    "en": "An organization."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:mbox"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:gender"
    },
    {
     "id": "foaf:age"
    },
    {
     "id": "foaf:birthday"
    },
    {
     "id": "foaf:topic_interest"
    },
    {
     "id": "foaf:status"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:account"
      },
      {
       "id": "foaf:skypeID"
      },
      {
       "id": "foaf:aimChatID"
      },
      {
       "id": "foaf:icqChatID"
      },
      {
       "id": "foaf:msnChatID"
      },
      {
       "id": "foaf:yahooChatID"
      },
      {
       "id": "foaf:jabberID"
      },
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:interest"
      },
      {
       "id": "foaf:mbox_sha1sum"
      },
      {
       "id": "foaf:made"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Group",
   "label": {
    "en": "Group"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Group"
   },
   "description": {
    "en": "A class of Agents."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:mbox"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:gender"
    },
    {
     "id": "foaf:age"
    },
    {
     "id": "foaf:birthday"
    },
    {
     "id": "foaf:topic_interest"
    },
    {
     "id": "foaf:status"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "id": "foaf:member"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:account"
      },
      {
       "id": "foaf:skypeID"
      },
      {
       "id": "foaf:aimChatID"
      },
      {
       "id": "foaf:icqChatID"
      },
      {
       "id": "foaf:msnChatID"
      },
      {
       "id": "foaf:yahooChatID"
      },
      {
       "id": "foaf:jabberID"
      },
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:interest"
      },
      {
       "id": "foaf:mbox_sha1sum"
      },
      {
       "id": "foaf:made"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Project",
   "label": {
    "en": "Project"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Project"
   },
   "description": {
    "en": "A project (a collective endeavour of some kind)."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:Image",
   "label": {
    "en": "Image"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Image"
   },
   "description": {
    "en": "An image."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:primaryTopic"
    },
    {
     "id": "foaf:topic"
    },
    {
     "id": "foaf:depicts"
    },
    {
     "id": "foaf:maker"
    },
    {
     "id": "foaf:thumbnail"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      },
      {
       "id": "foaf:sha1"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:PersonalProfileDocument",
   "label": {
    "en": "PersonalProfileDocument"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/PersonalProfileDocument"
   },
   "description": {
    "en": "A personal profile RDF document."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:primaryTopic"
    },
    {
     "id": "foaf:topic"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      },
      {
       "id": "foaf:sha1"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:OnlineAccount",
   "label": {
    "en": "Online Account"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/OnlineAccount"
   },
   "description": {
    "en": "An online account."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:accountName"
    },
    {
     "id": "foaf:accountServiceHomepage"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:OnlineGamingAccount",
   "label": {
    "en": "Online Gaming Account"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/OnlineGamingAccount"
   },
   "description": {
    "en": "An online gaming account."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:accountName"
    },
    {
     "id": "foaf:accountServiceHomepage"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:OnlineEcommerceAccount",
   "label": {
    "en": "Online E-commerce Account"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/OnlineEcommerceAccount"
   },
   "description": {
    "en": "An online e-commerce account."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:accountName"
    },
    {
     "id": "foaf:accountServiceHomepage"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "foaf:OnlineChatAccount",
   "label": {
    "en": "Online Chat Account"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/OnlineChatAccount"
   },
   "description": {
    "en": "An online chat account."
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:accountName"
    },
    {
     "id": "foaf:accountServiceHomepage"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "http://www.w3.org/2000/01/rdf-schema#Class",
   "label": {
    "en": "rdf-schema#Class"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/2000/01/rdf-schema#Class"
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "http://www.w3.org/2000/10/swap/pim/contact#Person",
   "label": {
    "en": "Person"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/2000/10/swap/pim/contact#Person"
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing",
   "label": {
    "en": "Spatial Thing"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing"
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:based_near"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  },
  {
   "id": "http://www.w3.org/2002/07/owl#Thing",
   "label": {
    "en": "Thing"
   },
   "constraints": {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/2002/07/owl#Thing"
   },
   "type": "group",
   "content": [
    {
     "id": "foaf:name"
    },
    {
     "id": "foaf:img"
    },
    {
     "id": "foaf:weblog"
    },
    {
     "id": "foaf:homepage"
    },
    {
     "id": "foaf:depiction"
    },
    {
     "id": "foaf:maker"
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Online accounts"
     },
     "content": [
      {
       "id": "foaf:openid"
      },
      {
       "id": "foaf:tipjar"
      }
     ]
    },
    {
     "cardinality": {
      "min": 1,
      "pref": 1,
      "max": 1
     },
     "type": "group",
     "cls": [
      "rformsexpandable"
     ],
     "label": {
      "en": "Additional information"
     },
     "content": [
      {
       "id": "foaf:page"
      },
      {
       "id": "foaf:isPrimaryTopicOf"
      },
      {
       "id": "foaf:logo"
      }
     ]
    }
   ]
  }
 ],
 "scope": "foaf",
 "namespace": "http://xmlns.com/foaf/0.1/",
 "root": {
  "id": "foaf:Person"
 }
});