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

dojo.provide("folio.data.Constants");

folio.data.SCAMBaseUri = "http://scam.sf.net/schema#";
folio.data.RDFBaseUri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
folio.data.DCBaseUri = "http://purl.org/dc/elements/1.1/";
folio.data.DCTermsBaseUri = "http://purl.org/dc/terms/";
folio.data.FOAFBaseUri = "http://xmlns.com/foaf/0.1/";

folio.data.RDFSchema = {
	TYPE: folio.data.RDFBaseUri+"type",
	VALUE: folio.data.RDFBaseUri+"value"
};

folio.data.SCAMSchema = {
	RESOURCE: folio.data.SCAMBaseUri+"resource",
	LOCAL_METADATA: folio.data.SCAMBaseUri+"metadata",
	EXTERNAL_METADATA: folio.data.SCAMBaseUri+"externalMetadata",
	CACHED_EXTERNAL_METADATA: folio.data.SCAMBaseUri+"cachedExternalMetadata",
	REFERRED_IN: folio.data.SCAMBaseUri+"referredIn",
	READ: folio.data.SCAMBaseUri+"read",
	WRITE: folio.data.SCAMBaseUri+"write",
	HAS_GROUP_MEMBER: folio.data.SCAMBaseUri+"hasGroupMember",
	HAS_LIST_MEMBER: folio.data.SCAMBaseUri+"hasListMember",
	HOME_CONTEXT: folio.data.SCAMBaseUri+"homeContext"
};

folio.data.DCSchema = {
	TITLE: folio.data.DCBaseUri+"title",
	DESCRIPTION: folio.data.DCBaseUri+"description"
};

folio.data.DCTermsSchema = {
	TITLE: folio.data.DCTermsBaseUri+"title",
	DESCRIPTION: folio.data.DCTermsBaseUri+"description",
	FORMAT: folio.data.DCTermsBaseUri+"format",
	EXTENT: folio.data.DCTermsBaseUri+"extent",
	CREATED: folio.data.DCTermsBaseUri+"created",
	MODIFIED: folio.data.DCTermsBaseUri+"modified",	
	CREATOR: folio.data.DCTermsBaseUri+"creator",
	CONTRIBUTOR: folio.data.DCTermsBaseUri+"contributor",
	RIGHTS: folio.data.DCTermsBaseUri+"rights"
};

folio.data.FOAFSchema = {
	NAME: folio.data.FOAFBaseUri+"name",
	FIRSTNAME: folio.data.FOAFBaseUri+"firstName",
	LASTNAME: folio.data.FOAFBaseUri+"lastName",
	SURNAME: folio.data.FOAFBaseUri+"surname",
	IMAGE: folio.data.FOAFBaseUri+"img",
	PLAN: folio.data.FOAFBaseUri+"plan",
	MBOX: folio.data.FOAFBaseUri+"mbox",
	THUMBNAIL: folio.data.FOAFBaseUri+ "thumbnail"
};

folio.data.LocationType = {
	LOCAL: 1,
	LINK: 2,
	LINK_REFERENCE: 3,
	REFERENCE: 4
};
folio.data.LocationTypeSchema = {
	LOCAL: folio.data.SCAMBaseUri+"Local",
	LINK: folio.data.SCAMBaseUri+"Link",
	LINK_REFERENCE: folio.data.SCAMBaseUri+"LinkReference",
	REFERENCE: folio.data.SCAMBaseUri+"Reference"
};

folio.data.RepresentationType = {
	INFORMATION_RESOURCE: 1,
	RESOLVABLE_INFORMATION_RESOURCE: 2,
	UNKOWN: 3,
	NAMED_RESOURCE: 4
};
folio.data.RepresentationTypeSchema = {
	INFORMATION_RESOURCE: folio.data.SCAMBaseUri+"InformationResource",
	RESOLVABLE_INFORMATION_RESOURCE: folio.data.SCAMBaseUri+"ResolvableInformationResource",
	UNKNOWN: folio.data.SCAMBaseUri+"Unknown",
	NAMED_RESOURCE: folio.data.SCAMBaseUri+"NamedResource"
};

folio.data.BuiltinType = {
	CONTEXT: 1,
	SYSTEM_CONTEXT: 2,
	USER: 3,
	GROUP: 4,
	LIST: 5,
	RESULT_LIST: 6,
	NONE: 7
};
folio.data.BuiltinTypeSchema = {
	CONTEXT: folio.data.SCAMBaseUri+"Context",
	SYSTEM_CONTEXT: folio.data.SCAMBaseUri+"SystemContext",
	USER: folio.data.SCAMBaseUri+"User",
	GROUP: folio.data.SCAMBaseUri+"Group",
	LIST: folio.data.SCAMBaseUri+"List",
	RESULT_LIST: folio.data.SCAMBaseUri+"ResultList",
	NONE: folio.data.SCAMBaseUri+"None"
};

folio.message = {
	INFO: 1,
	ERROR: 2,
	USER_ERROR: 3
};
