/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "folio/apps/TFolio",
    "dojo/text!./EFolioTemplate.html"
], function(declare, TFolio, template) {
    return declare(TFolio, {
        templateString: template
    });
});