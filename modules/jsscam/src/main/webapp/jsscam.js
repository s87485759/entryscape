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

/**
 * @fileOverview This file contains an implementation of the JavaScript SCAM
 *   API, within a namespace called 'SCAM'. Including this file only affects the
 *   SCAM namespace, i.e., it has no side-effects. The implementation depends on
 *   the JSON and XMLHttpRequest objects (built-in in modern browsers).
 * @author <a href="mailto:erikis@kth.se">Erik Isaksson</a>
 * @version 0.1
 */

/*jslint white: true, indent: 4, browser: true, bitwise: true, eqeqeq: true,
  immed: true, newcap: true, regexp: true, undef: true */

/**
 * SCAM is a development environment for building metadata stores for RDF and
 * the Semantic Web. SCAM is built upon international technology standards and
 * metadata standards, such as RDF, Dublin Core, IEEE/LOM and IMS.
 * 
 * <p>The entry point of the SCAM namespace is {@link SCAM.getRepository}.</p>
 * 
 * @namespace The SCAM JavaScript API.
 */
var SCAM = (function () {
	"use strict"; // Use strict mode within this namespace
	// If there already exists a SCAM namespace, then keep what's in it
	var SCAM = SCAM || {}; 
////////////////////////////////////////////////////////////////////////////////
// Static definitions
	
	/**
	 * Identifier for the SCAM entry object type.
	 * @private
	 */
	var KIND_ENTRY = 'entry';
	
	/**
	 * Identifier for the SCAM metadata object type.
	 * @private
	 */
	var KIND_METADATA = 'metadata';
	
	/**
	 * Identifier for the SCAM resource object type.
	 * @private
	 */
	var KIND_RESOURCE = 'resource';
	
	/**
	 * Identifier for RDF metadata.
	 */
	SCAM.RDF = 'rdf:';
	
	/**
	 * Identifier for Dublin Core metadata.
	 */
	SCAM.DCTERMS = 'dcterms:';  
	
////////////////////////////////////////////////////////////////////////////////
// REST/JSON functionality
	
	/**
	 * Creates an XMLHttpRequest object, in a manner compatible with the
	 * current browser environment.
	 *  
	 * @private
	 * @returns {XMLHttpRequest} The created XMLHttpRequest object.
	 * @throws {Object} If XMLHttpRequest is not supported in this environment.
	 */
	var createXMLHttpRequest = function () {
		/*global XMLHttpRequest, ActiveXObject */
		if (typeof XMLHttpRequest !== 'undefined') {
			return new XMLHttpRequest();
		} else if (typeof ActiveXObject !== 'undefined') {
			return new ActiveXObject('Microsoft.XMLHTTP');
		} else {
			throw {
				name: 'XMLHttpRequestError',
				message: 'XMLHttpRequest not supported'
			};
		}
	};
	
	/**
	 * Makes an asynchronous request over HTTP using XMLHttpRequest.
	 * 
	 * <p>It only supports application/json in both the request and response
	 * bodies.</p>
	 * 
	 * @private
	 * @param {String} method The HTTP method to use, e.g., 'GET'.
	 * @param {String} uri The URI from which host and path is to be extracted.
	 * @param {String} body The body to send with the request; an empty string
	 *   for none.
	 * @param {Object} params An object that optionally contains a user name
	 *   and password for the request, named 'user' and 'password, respectively,
	 *   e.g., { user: 'user', password: 'pwd' }. 
	 * @param {Function} callback A function to be called when the request has
	 *   been completed, accepting an XMLHttpRequest object as its only
	 *   argument.
	 */
	var doRequest = function (method, uri, body, params, callback) {
		// Requires the createXMLHttpRequest function
		var request = createXMLHttpRequest();
		request.open(method, uri, true, params.user, params.password);
		request.setRequestHeader('Accept', 'application/json');
		if (body.length > 0 || method === 'POST' || method === 'PUT') {
			request.setRequestHeader('Content-Type', 'application/json');
			request.setRequestHeader('Content-Length', body.length);
		}
		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				callback(request);
			}
		};
		request.send(body);
	};
	
	/**
	 * Makes an asynchronous HTTP GET request, accepting an application/json
	 * response body.
	 * 
	 * <p>The function returns immediately with the object passed in the object
	 * argument. On success, a setData function in the params object is called
	 * with the response's JSON object, in order for it to update the object
	 * returned by this function. The reason for this is to more easily have an
	 * object that can be used immediately, without waiting for the callback.
	 * This is useful when an object which knows, e.g., its identifier is
	 * already sufficient for some uses, while other uses requires waiting for
	 * the callback.</p>
	 * 
	 * <p>It is acceptable for the callback argument to be left undefined. In
	 * that case, the function will return the object of the object argument
	 * without attempting to make an actual request.</p>
	 * 
	 * @private
	 * @param {String} uri The URI from which host and path is to be extracted.
	 * @param {SCAM-Base} object The object to pass to the callback function on
	 *   success, and which this function will return immediately after
	 *   setting up the request.
	 * @param {Object} params An object containing a setData function, which is
	 *   passed the HTTP status code and the parsed JSON of the response body,
	 *   as its two arguments in that order. For other uses, see the argument of
	 *   the same name for the {@link SCAM-doRequest} function.
	 * @param {Function} callback A function to be called when the request has
	 *   been completed, accepting the given object on success, and a
	 *   {@link SCAM-Error} object on failure, as its only argument. May be left
	 *   undefined, in which case no request will be made and the returned
	 *   object never be updated.
	 * @returns {SCAM-Base} The object passed in the object argument.
	 */
	var doGet = function (uri, object, params, callback) {
		// Requires the doRequest function
		if (typeof callback !== 'undefined') {
			doRequest('GET', uri, '', params, function (response) {
				//if (response.status >= 200 && response.status < 300) {
				params.setData(response.status,
						JSON.parse(response.responseText));
				callback(object);
				//} else {
				//	callback(Error.instantiate(
				//			JSON.parse(response.responseText)));
				//}
			});
		}
		return object;
	};
	
	/**
	 * Makes an asynchronous HTTP PUT request, sending along an application/json
	 * request body and accepting an application/json response body.
	 * 
	 * <p>The function returns immediately with the object passed in the object
	 * argument. On success, a setData function in the params object is called
	 * with the response's JSON object, in order for it to update the object
	 * returned by this function. The reason for this is to more easily have an
	 * object that can be used immediately, without waiting for the callback.
	 * This is useful when an object which knows, e.g., its identifier is
	 * already sufficient for some uses, while other uses requires waiting for
	 * the callback.</p>
	 * 
	 * <p>It is acceptable for the callback argument to be left undefined. In
	 * that case, the function will return the object of the object argument
	 * without attempting to make an actual request.</p>
	 * 
	 * @private
	 * @param {String} uri The URI from which host and path is to be extracted.
	 * @param {SCAM-Base} object The object to be JSON-stringified and sent in
	 *   the request body. Also, the object to pass to the callback function on
	 *   success, and which this function will return immediately after
	 *   setting up the request.
	 * @param {Object} params An object containing a setData function, which is
	 *   passed the HTTP status code and the parsed JSON of the response body,
	 *   as its two arguments in that order. For other uses, see the argument of
	 *   the same name for the {@link SCAM-doRequest} function.
	 * @param {Function} callback A function to be called when the request has
	 *   been completed, accepting the given object on success, and a
	 *   {@link SCAM-Error} object on failure, as its only argument. May be left
	 *   undefined, in which case no request will be made and the returned
	 *   object never be updated.
	 * @returns {SCAM-Base} The object passed in the object argument.
	 */
	var doPut = function (uri, object, params, callback) {
		// Requires the doRequest function
		if (typeof callback !== 'undefined') {
			doRequest('PUT', uri, object.stringify(), params,
					function (response) {
				params.setData(response.status,
						JSON.parse(response.responseText));
				callback(object);
			});
		}
		return object;
	};
	
	/**
	 * Makes an asynchronous HTTP POST request, sending along an
	 * application/json request body and accepting an application/json response
	 * body.
	 * 
	 * <p>The function returns immediately with the object passed in the object
	 * argument. On success, a setData function in the params object is called
	 * with the response's JSON object, in order for it to update the object
	 * returned by this function. The reason for this is to more easily have an
	 * object that can be used immediately, without waiting for the callback.
	 * This is useful when an object which knows, e.g., its identifier is
	 * already sufficient for some uses, while other uses requires waiting for
	 * the callback.</p>
	 * 
	 * <p>It is acceptable for the callback argument to be left undefined. In
	 * that case, the function will return the object of the object argument
	 * without attempting to make an actual request.</p>
	 * 
	 * @private
	 * @param {String} uri The URI from which host and path is to be extracted.
	 * @param {SCAM-Base} object The object to be JSON stringified and sent in
	 *   the request body. Also, the object to pass to the callback function on
	 *   success, and which this function will return immediately after
	 *   setting up the request.
	 * @param {Object} params An object containing a setData function, which is
	 *   passed the HTTP status code and the parsed JSON of the response body,
	 *   as its two arguments in that order. For other uses, see the argument of
	 *   the same name for the {@link SCAM-doRequest} function.
	 * @param {Function} callback A function to be called when the request has
	 *   been completed, accepting the given object on success, and a
	 *   {@link SCAM-Error} object on failure, as its only argument. May be left
	 *   undefined, in which case no request will be made and the returned
	 *   object never be updated.
	 * @returns {SCAM-Base} The object passed in the object argument.
	 */
	var doPost = function (uri, object, params, callback) {
		// Requires the doRequest function
		if (typeof callback !== 'undefined') {
			doRequest('POST', uri, object.stringify(), params,
					function (response) {
				params.setData(response.status,
						JSON.parse(response.responseText));
				callback(object);
			});
		}
		return object;
	};
	
	/**
	 * Makes an asynchronous HTTP DELETE request, accepting an application/json
	 * response body.
	 * 
	 * <p>The function returns immediately with the object passed in the object
	 * argument. On success, a setData function in the params object is called
	 * with the response's JSON object, in order for it to update the object
	 * returned by this function. The reason for this is to more easily have an
	 * object that can be used immediately, without waiting for the callback.
	 * This is useful when an object which knows, e.g., its identifier is
	 * already sufficient for some uses, while other uses requires waiting for
	 * the callback.</p>
	 * 
	 * <p>It is acceptable for the callback argument to be left undefined. In
	 * that case, the function will return the object of the object argument
	 * without attempting to make an actual request.</p>
	 * 
	 * @private
	 * @param {String} uri The URI from which host and path is to be extracted.
	 * @param {SCAM-Base} object The object to be JSON stringified and sent in
	 *   the request body. Also, the object to pass to the callback function on
	 *   success, and which this function will return immediately after
	 *   setting up the request.
	 * @param {Object} params An object containing a setData function, which is
	 *   passed the HTTP status code and the parsed JSON of the response body,
	 *   as its two arguments in that order. For other uses, see the argument of
	 *   the same name for the {@link SCAM-doRequest} function.
	 * @param {Function} callback A function to be called when the request has
	 *   been completed, accepting the given object on success, and a
	 *   {@link SCAM-Error} object on failure, as its only argument. May be left
	 *   undefined, in which case no request will be made and the returned
	 *   object never be updated.
	 * @returns {SCAM-Base} The object passed in the object argument.
	 */
	var doDelete = function (uri, object, params, callback) {
		// Requires the doRequest function
		if (typeof callback !== 'undefined') {
			doRequest('DELETE', uri, object.stringify(), params,
					function (response) {
				params.setData(response.status,
						JSON.parse(response.responseText));
				callback(object);
			});
		}
		return object;
	};
	
	/**
	 * Assembles a SCAM URI from a set of components.
	 * 
	 * @private
	 * @param {String} baseUri The base URI, e.g., 'http://example/scam'.
	 * @param {String} portfolioId The identifier of the portfolio, e.g., '1' or
	 *   '_contexts'. 
	 * @param {String} kindId The SCAM object type, e.g., KIND_ENTRY.
	 * @param {String} entryId The identifier of the object, e.g., '1' or
	 *   '_top'.
	 * @param {Object} parameterMap An object containing the parameters to
	 *   include in the query part of the URI, e.g., { 'name': 'value' }.
	 * @returns {String} The assembled URI.
	 */
	var assembleCommonUri = function (baseUri, portfolioId, kindId, entryId,
			parameterMap) {
		var param;
		var query = '';
		if (typeof parameterMap !== 'undefined') {
			for (param in parameterMap) {
				if (parameterMap.hasOwnProperty(param)) {
					query = query.concat(query.length === 0 ? '?' : '&',
							encodeURIComponent(param), '=',
							encodeURIComponent(parameterMap[param]));
				}
			}
		}
		return baseUri.concat('/', portfolioId, '/', kindId, '/', entryId,
				query);
	};
	
////////////////////////////////////////////////////////////////////////////////
// Utility functions

	/**
	 * Checks whether the given object is a JavaScript array or not.
	 * 
	 * <p>The implementation is from Douglas Crockford's suggestion in his book
	 * <em>JavaScript: The Good Parts</em>.</p>
	 * 
	 * @private
	 * @param {Object} obj The object which is to be tested for being an array.
	 * @returns {Boolean} True if the object is an array, otherwise false.
	 */
	var isArray = function (obj) {
		return obj && typeof obj === 'object' &&
			typeof obj.length === 'number' &&
			!(obj.propertyIsEnumerable('length'));
	};
	
	/**
	 * Parses an XML date string and returns a {@link Date} object.
	 * 
	 * @private
	 * @param {String} xmlDate The XML date string to parse.
	 * @returns {Date} The Date object.
	 */
	var parseXmlDate = function (xmlDate) {
		if (typeof xmlDate === 'undefined') {
			return;
		}
		var comp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})([+\-]\d{2}):(\d{2})$/
			.exec(xmlDate);
		return new Date(Date.UTC(comp[1], comp[2], comp[3], comp[4] - comp[8],
				comp[5] - comp[9], comp[6], comp[7]));
	};
	
	/**
	 * Formats an XML date string from a {@link Date} object.
	 * 
	 * @private
	 * @param {Date} date The Date object.
	 * @returns {String} The XML date string.
	 */
	var toXmlDate = function (date) {
		if (typeof date === 'undefined') {
			return;
		}
		var year = date.getFullYear().toString();
		var month = date.getMonth().toString();
		if (month.length === 1) {
			month = '0'.concat(month);
		}
		var day = date.getDate().toString();
		if (day.length === 1) {
			day = '0'.concat(day);
		}
		var hour = date.getHours().toString();
		if (hour.length === 1) {
			hour = '0'.concat(hour);
		}
		var minute = date.getMinutes().toString();
		if (minute.length === 1) {
			minute = '0'.concat(minute);
		}
		var second = date.getSeconds().toString();
		if (second.length === 1) {
			second = '0'.concat(second);
		}
		var millisecond = date.getMilliseconds().toString();
		if (millisecond.length === 1) {
			millisecond = '00'.concat(millisecond);
		} else if (millisecond.length === 2) {
			millisecond = '0'.concat(millisecond);
		}
		var tzSign = (0 - date.getTimezoneOffset()) < 0 ? '-' : '+';
		var tzHour = (Math.abs(date.getTimezoneOffset()) / 60)
				.toFixed().toString();
		if (tzHour.length === 1) {
			tzHour = '0'.concat(tzHour);
		}
		var tzMinute = (Math.abs(date.getTimezoneOffset()) % 60).toString();
		if (tzMinute.length === 1) {
			tzMinute = '0'.concat(tzMinute);
		}
		return year.concat('-', month, '-', day, 'T', hour, ':', minute, ':',
				second, '.', millisecond, tzSign, tzHour, ':', tzMinute);
	};
	
	/**
	 * Creates a new object with the given object as its prototype.
	 * 
	 * <p>From Douglas Crockford's book <em>JavaScript: The Good Parts</em>, but
	 * as a standalone function instead of augmenting {@link Object}, because we
	 * prefer that there are no side-effects to including this script.</p>
	 * 
	 * @private
	 * @param {Object} o The prototype.
	 * @returns {Object} The new object.
	 */
	var beget = function (o) {
		var F = function () {};
		F.prototype = o;
		return new F();
	};
	
	/**
	 * Prepares an object for being used as a prototype of new objects,
	 * optionally using a prototype for the prepared object as well. Also, for
	 * each method with a name starting with '_initialize' in the object to be
	 * prepared, a corresponding method with a name starting with
	 * '__instantiate' is created.
	 * 
	 * <p>An '__instantiate' method is meant to be used as a static function
	 * which creates a new object instance using the prepared object as a
	 * prototype, and subsequently calls the corresponding '_initialize' method
	 * with the same arguments that were passed to it, but with the 'this'
	 * variable set to the created object instance. (Note the convention of
	 * using an '_' (underline) prefix for private instance methods, and a '__'
	 * (double underline) prefix for (public) static methods. Other methods are
	 * assumed to be public instance methods.)</p>
	 * 
	 * <p>The created object is not directly returned by the '__instantiate'
	 * method. Instead, a second object is created which has a corresponding
	 * method for each method which has a name not starting with '_', i.e., all
	 * non-private and non-static methods. Calling these new methods has the
	 * same effect as calling the methods on the original object. The advantage
	 * of this new object is that it does not allow access from the outside to
	 * anything that is not meant to be publicly accessible. The new (outer)
	 * object is accessible from within the original (inner) object as
	 * <code>this.me</code>.</p>
	 * 
	 * @private
	 * @param {Object} o If p is defined, then this is the object to be used as
	 *   a prototype for the prepared object. If p is undefined, then no
	 *   prototype is set for the prepared object, and this argument is used
	 *   instead of p (the usage of p then applies to this argument). 
	 * @param {Object} p The object to be prepared for being used as a
	 *   prototype.
	 * @returns {Object} The prepared object, which may be the same object as
	 *   that which was passed in p.
	 */
	var proto = function (o, p) {
		// Requires the beget function
		var n, f, l = {};
		if (typeof p !== 'undefined') {
			o = beget(o);
			for (n in p) {
				if (p.hasOwnProperty(n)) {
					o[n] = p[n];
				}
			}
		}
		for (n in o) {
			if (o.hasOwnProperty(n) && typeof o[n] === 'function' &&
					n.indexOf('_initialize') === 0) {
				f = o[n];
				l['__instantiate' + n.substring(11)] = (function () {
					return function () {
						var q = beget(o);
						var r = {}, n, m; // Instance seal begin
						for (n in q) {
							if (n.substring(0, 1) !== '_') {
								m = q[n];
								if (typeof m === 'function' &&
										!Object.prototype.hasOwnProperty(m)) {
									r[n] = (function (a, b) {
										return function () {
											return a.apply(b, arguments);
										};
									}(m, q));
								}
							}
						} // Instance seal end
						q.me = r;
						f.apply(q, arguments); // Run initialize on unsealed
						return r; // Return sealed (r), not unsealed (q)
					};
				}());
			}
		}
		for (n in l) { // Apply the new methods to the prepared object
			if (l.hasOwnProperty(n)) {
				o[n] = l[n]; 
			}
		}
		return o;
	};
	
	/**
	 * Takes an object prepared by the proto function and returns a new object
	 * with members corresponding to the given object's static members. I.e.,
	 * only members with names starting with '__' (double underline) are
	 * included. The '__' is removed from the beginning of their names.
	 * 
	 * <p>As the new object does not give access to anything on the original
	 * object besides its static members (e.g., the instantiation methods),
	 * it should generally be safe to make the returned object public as long as
	 * instantiation (and access to other static methods) is intended to be
	 * public. Further protection could, however, be implemented by using the
	 * delete operator on members of the returned object.</p>
	 * 
	 * <p>Note that there is no special consideration for functions. I.e., the
	 * 'this' variable will not be correct. This should not be an issue,
	 * however, because the functions are supposed to be static and hence
	 * not require access to any instance.</p>
	 * 
	 * @private
	 * @param {Object} o The object to be sealed.
	 * @returns {Object} The sealed object.
	 */
	var seal = function (o) {
		var n, p = {};
		for (n in o) {
			if (o.hasOwnProperty(n) && n.substring(0, 2) === '__') {
				p[n.substring(2)] = o[n];
			}
		}
		return p;
	};
	
////////////////////////////////////////////////////////////////////////////////
// Base objects with JDIL functionality
	
	var _Base = proto(/**@lends SCAM-Base.prototype*/{
		/**
		 * Represents a web resource, and is the base of all SCAM objects. 
		 *   
		 * <p>This object is the base of all SCAM objects; all SCAM objects use
		 * this as their prototype, directly or indirectly.</p>
		 * 
		 * @class Represents a web resource, and is the base of all SCAM
		 *   objects. 
		 * @constructs
		 */
		_initialize: function (params) {
			if (typeof params !== 'undefined') {
				this._setData(params.status || 0, params.data || {});
				params.setData = (function (a, b) {
					return function () {
						a.apply(b, arguments);
					};
				}(this._setData, this));
			}
		},
		/**
		 * Sets the data contained within this object.
		 * 
		 * To be used after, e.g., an asynchronous HTTP request has been
		 * completed.
		 * 
		 * @param {Number} status The HTTP status code.
		 * @param {Object} data The data (i.e., a JSON object).
		 * @private
		 */
		_setData: function (status, data) {
			this.status = status;
			if (data.error) {
				this.data = {};
				this.error = data.error;
			} else {
				this.data = data;
				this.error = null;
			}
		},
		/**
		 * If this object is currently in an error state, then this function
		 * will throw that error and clear the error state.
		 * 
		 * This method exists to make it possible to catch errors that have
		 * occurred during an asynchronous call.
		 * 
		 * @returns {Object} An object with <code>name</code> and
		 *   <code>message</code> fields. The name is 'ScamError' and the
		 *   message is one that describes the error.
		 */
		throwException: function () {
			if (this.error) {
				var exception = {
					name: 'ScamError',
					message: this.error
				};
				delete this.error;
				throw exception;
			}
		},
		/**
		 * Returns the current HTTP status code for this object.
		 * @returns {Number} The status code, e.g., 200 for <em>OK</em>.
		 */
		getStatus: function () {
			return this.status;
		},
		/**
		 * Returns a JSON representation of this object.
		 * 
		 * @return {String} JSON representation (stringified).
		 */
		toRepresentation: function () {
			return JSON.stringify(this.data);
		}
	});
	
	var _Graph = proto(_Base, /**@lends SCAM-Graph.prototype*/{
		/**
		 * Represents metadata stored within a SCAM entry.
		 * 
		 * @class Represents metadata stored within a SCAM entry.
		 * @constructs
		 * @extends SCAM-Base 
		 */
		_initialize: function (params) {
			_Base._initialize.call(this, params);
		},
		/**
		 * Subject to change.
		 */
		getInfo: function (name, type, index) {
			if (this.data.hasOwnProperty(name)) {
				index = index || 0;
				var p = this.data[name];
				if (isArray(p)) {
					if (typeof p[index] !== 'undefined') {
						return p[index][type];
					}
				} else if (index === 0) {
					return p[type];
				}
			}
		},
		/**
		 * Subject to change.
		 */
		setInfo: function (name, type, value, index) {
			index = index || 0;
			if (!this.data.hasOwnProperty(name)) {
				this.data[name] = {};
			}
			var p = this.data[name];
			if (isArray(p)) {
				if (typeof p[index] !== 'undefined') {
					p[index][type] = value;
				}
			} else if (index === 0) {
				p[type] = value;
			}
		},
		/**
		 * Subject to change.
		 */
		getId: function (name) {
			return this.getInfo(name, '@id');
		},
		/**
		 * Subject to change.
		 */
		setId: function (name, value) {
			this.setInfo(name, '@id', value);
		},
		/**
		 * Subject to change.
		 */
		getValue: function (name) {
			return this.getInfo(name, '@value');
		},
		/**
		 * Subject to change.
		 */
		setValue: function (name, value) {
			this.setInfo(name, '@value', value);
		},
		/**
		 * Subject to change.
		 */
		getLanguage: function (name) {
			return this.getInfo(name, '@language');
		},
		/**
		 * Subject to change.
		 */
		setLanguage: function (name, value) {
			this.setInfo(name, '@language', value);
		}
	});
	
	//	var _Error = proto(_Base,/**@lends SCAM-Error.prototype*/{
//		/**
//		 * A SCAM error object.
//		 * @constructs
//		 * @extends SCAM-Base
//		 */
//		_initialize: function (data, params) {
//			this.name = 'ScamError';
//			params = params || {};
//			params.data = params.data || data;
//			_Base._initialize.call(this, params);
//		},
//		/**
//		 * @private
//		 */
//		_setData: function (status, data) {
//			_Base._setData.call(this, status, data);
//			this.message = data.error;
//		},
//		/**
//		 * 
//		 */
//		throwException: function () {
//			throw this;
//		}
//	});var Error=seal(_Error);
	
////////////////////////////////////////////////////////////////////////////////
// Objects for specific SCAM functionality
	
	var Repository, Entry, Portfolio, Metadata, Metametadata, Resource;
	
	var _Repository = proto(_Base,/**@lends SCAM-Repository.prototype*/{
		/**
		 * Represents a SCAM repository session, which provides access to
		 * portfolios.
		 * 
		 * @class Represents a SCAM repository session, which provides access to
		 *   portfolios.
		 * @constructs
		 * @extends SCAM-Base
		 */
		_initialize: function (baseUri, params) {
			_Base._initialize.call(this, params);
			this.baseUri = baseUri;
		},
		/**
		 * Returns the base URI of the repository.
		 * 
		 * @returns {String} The base URI.
		 */
		getBaseUri: function () {
			return this.baseUri;
		},
		/**
		 * Returns the portfolio with the given id
		 * .
		 * @returns {SCAM-Portfolio} The portfolio.
		 */
		getPortfolio: function (portfolioId, callback) {
			var params = {};
			return doGet(assembleCommonUri(this.baseUri, '_contexts',
					KIND_ENTRY, portfolioId, { includeAll: 'includeAll' }),
					Portfolio.instantiate(this, portfolioId, params), params,
					callback);			
		},
		/**
		 * Returns the entry whose subject is this repository.
		 * 
		 * The entry's metadata describes this repository, and the entry's
		 * resource contains sub-entries that constitute the portfolios within
		 * this repository, with associated metadata.
		 * 
		 * @returns {SCAM-Entry} The entry for this repository.
		 */
		getSelfEntry: function (callback) {
			var params = {};
			return doGet(assembleCommonUri(this.baseUri, '_contexts',
					KIND_ENTRY, '_all', { includeAll: 'includeAll' }),
					Entry.instantiate(null, '_all', params), params, callback);			
		},
		/**
		 * 
		 */
		/*getUserId: function () {
			return this.data.id;
		},*/
		/**
		 * 
		 */
		/*getUserName: function () {
			return this.data.user;
		},*/
		/**
		 * Returns the current user's home portfolio.
		 * 
		 * @returns {SCAM-Portfolio} The home portfolio.
		 */
		getHomePortfolio: function (callback) {
			return this.getPortfolio(this.data.homecontext, callback);
		}
	});
	Repository = seal(_Repository);
	
	var _Entry = proto(_Base,/**@lends SCAM-Entry.prototype*/{
		/**
		 * Represents a SCAM entry, which contains a subject resource, metadata
		 * about the subject, and metadata about the metadata.
		 *   
		 * @class Represents a SCAM entry, which contains a subject resource,
		 *   metadata about the subject, and metadata about the metadata. 
		 * @constructs
		 * @extends SCAM-Base
		 */
		_initialize: function (portfolio, entryId, params) {
			_Base._initialize.call(this, params);
			this.portfolio = portfolio;
			this.entryId = entryId;
		},
		/**
		 * Returns the identifier of this entry.
		 * 
		 * @returns {String} The entry identifier.
		 */
		getId: function () {
			return this.data.info['@id'];
		},
		/**
		 * Returns metadata that is stored within this entry.
		 * 
		 * @returns {SCAM-Metadata} The metadata.
		 */
		getMeta: function () {
			return Metadata.instantiate(this.portfolio, this.entryId, {
				status: this.status,
				data: this.data.metadata
			});
		},
		/**
		 * Returns metadata that is referred to but not stored within the entry.
		 * 
		 * @returns {SCAM-Metadata} The metadata.
		 */
		getExternalMeta: function () {
			return Metadata.instantiate(this.portfolio, this.entryId, {
				status: this.status,
				data: {} // TODO
			});
		},
		/**
		 * Returns all metadata that is available.
		 * 
		 * @returns {SCAM-Metadata} The metadata.
		 */
		getAllMeta: function () {
			return Metadata.instantiate(this.portfolio, this.entryId, {
				status: this.status,
				data: this.data.metadata
			});
		},
		/**
		 * Returns metadata about the metadata within this entry.
		 * 
		 * @returns {SCAM-Metametadata} The meta-metadata.
		 */
		getMetameta: function () {
			return Metametadata.instantiate(this.portfolio, this.entryId, {
				status: this.status,
				data: this.data.info
			});
		},
		/**
		 * Returns the resource which constitutes the subject of this entry.
		 * 
		 * @returns {SCAM-Resorce} The subject resource.
		 */
		getResource: function () {
			return Resource.instantiate(this.portfolio, this.entryId, {
				status: this.status,
				data: this.data.resource
			});
		}
	});
	Entry = seal(_Entry);
	
	var _Portfolio = proto(_Entry,/**@lends SCAM-Portfolio.prototype*/{
		/**
		 * Represents a SCAM portfolio, which contains and manages entries.
		 * 
		 * @class Represents a SCAM portfolio, which contains and manages
		 *   entries.
		 * @constructs
		 * @extends SCAM-Entry
		 */
		_initialize: function (repository, portfolioId, params) {
			_Base._initialize.call(this, params);
			this.repository = repository;
			this.portfolioId = portfolioId;
			this.baseUri = repository.getBaseUri();
		},
		/**
		 * Returns the entry whose subject is this portfolio.
		 * 
		 * The entry's metadata describes this portfolio.
		 * 
		 * @returns {SCAM-Entry} The entry for this portfolio.
		 */
		getSelfEntry: function () {
			return Entry.instantiate(this, '_top', {
				status: this.status,
				data: this.data
			});
		},
		/**
		 * Creates a new entry object, intended for posting as an entry to this
		 * portfolio.
		 * 
		 * @returns {SCAM-Entry} The new entry object.
		 */
		createEntry: function () {
			return Entry.instantiate(this);
		},
		/**
		 * Returns the home (top) entry of this portfolio.
		 * 
		 * The entry's resource contains sub-entries, which are the contents
		 * of the home entry (i.e., the home entry is a folder).
		 * 
		 * @returns {SCAM-Entry} The home entry.
		 */
		getHomeEntry: function (callback) {
			return this.getEntry('_top', callback);
		},
		/**
		 * Retrieves the entry with the given id from the portfolio.
		 * 
		 * @returns {SCAM-Entry} The requested entry.
		 */
		getEntry: function (entryId, callback) {
			var params = {};
			return doGet(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_ENTRY, entryId, { includeAll: 'includeAll' }),
					Entry.instantiate(this, entryId, params), params, callback);
		},
		/**
		 * Puts the entry with the given id, storing it within the portfolio.
		 * 
		 * Subject to change.
		 * 
		 * @returns {SCAM-Entry} The entry that was stored.
		 */
		putEntry: function (entryId, entry, callback) {
			return doPut(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_ENTRY, entryId), entry, callback);
		},
		/**
		 * Posts a new entry, storing it within the portfolio.
		 * 
		 * Subject to change.
		 * 
		 * @returns {SCAM-Entry} The entry that was stored.
		 */
		postEntry: function (entry, callback) {
			return doPost(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_ENTRY, ''), entry, callback);
		},
		/**
		 * Deletes the entry with the given id from the portfolio.
		 * 
		 * Subject to change.
		 * 
		 * @returns {SCAM-Entry} The entry that was deleted.
		 */
		deleteEntry: function (entryId, callback) {
			return doDelete(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_ENTRY, entryId), callback);
		}
		/*createMetadata: function () {
			return Metadata.instantiate(this);
		},*/
		/*getMetadata: function (entryId, callback) {
			if (typeof entryId === 'undefined') {
				return _Entry.getMetadata.call(this);
			}
			var params = {};
			return doGet(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_METADATA, entryId, params), params,
					function (response, data) {
				callback(response.status >= 200 && response.status < 300 ?
						Metadata.instantiate(this, entryId) :
							Error.instantiate(data));
			});
		},*/
		/*putMetadata: function (entryId, metadata, callback) {
			return doPut(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_METADATA, entryId), metadata, callback);
		},*/
		/*deleteMetadata: function (entryId, callback) {
			return doDelete(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_METADATA, entryId), callback);
		},*/
		/*createResource: function () {
			return Resource.instantiate(this);
		},*/
		/*getResource: function (entryId, callback) {
			return doGet(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_RESOURCE, entryId), function (response, data) {
				callback(response.status >= 200 && response.status < 300 ?
						Resource.instantiate(this, entryId) :
							Error.instantiate(data));
			});
		},*/
		/*putResource: function (entryId, resource, callback) {
			return doPut(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_RESOURCE, entryId), resource, callback);
		},*/
		/*deleteResource: function (entryId, callback) {
			return doDelete(assembleCommonUri(this.baseUri, this.portfolioId,
					KIND_RESOURCE, entryId), callback);
		}*/
	});
	Portfolio = seal(_Portfolio);
	
	var _Metadata = proto(_Graph,/**@lends SCAM-Metadata.prototype*/{
		/**
		 * Extended {@link SCAM-Graph} with convenience methods for managing
		 * metadata about a SCAM entry's subject.
		 *   
		 * @class Extended {@link SCAM-Graph} with convenience methods for
		 *   managing metadata about a SCAM entry's subject.
		 * @constructs
		 * @extends SCAM-Graph
		 */
		_initialize: function (portfolio, entryId, params) {
			_Base._initialize.call(this, params);
			this.portfolio = portfolio;
			this.entryId = entryId;
		},
		/**
		 * Returns the title stored in the metadata.
		 * 
		 * @returns {String} The title.
		 */
		getTitle: function () {
			return this.getValue(SCAM.DCTERMS + 'title');
		},
		/**
		 * Sets the title stored in the metadata.
		 * 
		 * @param {String} value The title.
		 */
		setTitle: function (value) {
			this.setValue(SCAM.DCTERMS + 'title', value);
		}
	});
	Metadata = seal(_Metadata);
	
	var _Metametadata = proto(_Graph,/**@lends SCAM-Metametadata.prototype*/{
		/**
		 * Extended {@link SCAM-Graph} with convenience methods for managing
		 * metadata about a SCAM entry's metadata.
		 *   
		 * @class Extended {@link SCAM-Graph} with convenience methods for
		 *   managing metadata about a SCAM entry's metadata.
		 * @constructs
		 * @extends SCAM-Graph
		 */
		_initialize: function (portfolio, entryId, params) {
			_Base._initialize.call(this, params);
			this.portfolio = portfolio;
			this.entryId = entryId;
		},
		/**
		 * Returns the type stored in the metadata.
		 * 
		 * @returns {String} The type.
		 */
		getType: function () {
			return this.getId(SCAM.RDF + 'type');
		},
		/**
		 * Sets the type stored in the metadata.
		 * 
		 * @param {String} value  The type.
		 */
		/*setType: function (value) {
			this.setId(SCAM.RDF + 'type', value);
		},*/
		/**
		 * Returns the modification time.
		 * 
		 * @returns {Date} The modification time as a {@link Date} object.
		 */
		getModified: function () {
			return parseXmlDate(this.getValue(SCAM.DCTERMS + 'modified'));
		}
	});
	Metametadata = seal(_Metametadata);
	
	var _Resource = proto(_Base,/**@lends SCAM-Resource.prototype*/{
		/**
		 * Represents a SCAM entry's subject.
		 * 
		 * @class Represents a SCAM entry's subject.
		 * @constructs
		 * @extends SCAM-Base
		 */
		_initialize: function (portfolio, entryId, params) {
			_Base._initialize.call(this, params);
			this.portfolio = portfolio;
			this.entryId = entryId;
		},
		/**
		 * Returns the sub-entries contained in this resource.
		 * 
		 * @returns {SCAM-Entry[]} The sub-entries.
		 */
		getEntries: function () {
			var entries = [];
			var i;
			if (isArray(this.data)) {
				for (i = 0; i < this.data.length; i++) {
					entries.push(Entry.instantiate(this.portfolio,
							this.data[i]));
				}
				return entries;
			}
			if (typeof this.data.children === 'undefined') {
				return entries;
			}
			for (i = 0; i < this.data.children.length; i++) {
				var child = this.data.children[i];
				entries.push(
					Entry.instantiate(this.portfolio, child.entryId,
					{ data: {
						metadata: child.metadata_stub,
						info: child.info_stub,
						entryId: child.entryId
					}, status: this.status }));
			}
			return entries;
		}
	});
	Resource = seal(_Resource);

////////////////////////////////////////////////////////////////////////////////
// Public interface for accessing SCAM functionality

	/**
	 * Retrieves a SCAM session (i.e., a {@link SCAM-Repository} object) by
	 * making an asynchronous login request to a SCAM repository.
	 * 
	 * <p>It is acceptable for the callback argument to be left undefined. In
	 * that case, the function will return the repository object without
	 * attempting to make an actual login request, and the object will never be
	 * updated to become fully functional. Also, the user will never become
	 * logged in, and therefore the user and password arguments are irrelevant
	 * (i.e., only guest access to the repository will be possible).</p>
	 * 
	 * <p>For technical reasons, it is important that only one user has an
	 * active session for each repository. Because of this, make sure that no
	 * objects remain that originate from a previous session after a new
	 * session has been retrieved for a different user. Reverting to guest
	 * access after having logged in previously is also not possible without
	 * a restart of the web browser. This paragraph is specific to this
	 * implementation and subject to change.</p>
	 * 
	 * @param uri {String} The base URI of the SCAM repository, e.g.,
	 *   'http://example/scam'.
	 * @param user {String} The user name of the SCAM repository user, or null
	 *   for guest access.
	 * @param password {String} The password of the SCAM repository user, or
	 *   null for guest access.
	 * @param callback {Function} A function to be called when the asynchronous
	 *   login request has been completed, accepting the session object on
	 *   success, and a {@link SCAM-Error} object on failure, as its only
	 *   argument. May be left undefined, in which case no request will be made
	 *   and the returned session object never be updated.
	 * @returns {SCAM-Repository} The repository object, which will be updated
	 *   on successful completion of the asynchronous login request. The object
	 *   will not be fully functional prior to the update.
	 */
	SCAM.getRepository = function (uri, user, password, callback) {
		// Requires the doGet function
		var params = { user: user, password: password };
		return doGet(uri + '/login', Repository.instantiate(uri, params),
				params, callback);
	};
	
	return SCAM;
/*var SCAM = (function () {*/
}());