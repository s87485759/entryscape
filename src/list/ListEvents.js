/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/_base/window",
    "dojo/on",
    "dojo/keys"
], function(declare, lang, event, win, on, keys) {

    return declare(null, {
        //===================================================
        // Public Attributes
        //===================================================
        list: null,
        actions: null,


        //===================================================
        // Public API
        //===================================================
        constructor: function(list, actions) {
            this.list = list;
            this.actions = actions;
        },
        listenForKeyEvents: function () {
            if (!this._keyEventConnector) {
                this._keyEventConnector = on(win.body(), "keydown", lang.hitch(this, this.handleKeyPress));
            }
        },
        stopListenForKeyEvents: function () {
            if (this._keyEventConnector) {
                this._keyEventConnector.remove();
                delete this._keyEventConnector;
            }
        },

        handleKeyPress: function (ev) {
            if (ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey) {
                return;
            }
            if (this.list.listEntry) {
                if (this.actions.in_rename_mode()) {
                    switch (ev.keyCode) {
                        case keys.ESCAPE:
                            this.actions.abort_rename();
                            event.stop(ev);
                            break;
                        case keys.ENTER:
                            this.actions.do_rename();
                            event.stop(ev);
                            break;
                    }
                    return;
                }

                var maxIndex = this.list.listChildren.length - 1;
                switch (ev.keyCode) {
                    case keys.DOWN_ARROW:
                        if (maxIndex === -1) {
                            return;
                        }
                        if (this.list.selectedIndex == -1) {
                            this.list.setSelectedByIndex(0);
                        } else if (this.list.selectedIndex < maxIndex) {
                            this.list.setSelectedByIndex(this.list.selectedIndex + 1);
                        }
                        event.stop(ev);
                        break;
                    case keys.UP_ARROW:
                        if (maxIndex === -1) {
                            return;
                        }
                        if (this.list.selectedIndex > 0) {
                            this.list.setSelectedByIndex(this.list.selectedIndex - 1);
                        } else if (this.list.selectedIndex == -1) {
                            this.list.setSelectedByIndex(maxIndex);
                        }
                        event.stop(ev);
                        break;
                    case keys.LEFT_ARROW:
                    case 85: // Letter u should go one level up.
                        // Note: Backspace per browser default means previous page which might coincide, but not neccessarily.
                        var refs = this.list.listEntry.getReferrents();
                        if (refs.length > 0) {
                            this.list.application.openEntry(refs[0]);
                        } else {
                            this.list.application.openEntry(this.list.listEntry.getContext().getUri() + "/entry/_systemEntries");
                        }
                        event.stop(ev);
                        return;
                    case keys.ESCAPE:
                        this.list.setSelectedByIndex(-1);
                        event.stop(ev);
                        break;
                    case keys.RIGHT_ARROW:
                    case keys.ENTER:
                        this.actions.openchild(this.list.getSelectedEntry(), ev);
                        event.stop(ev);
                        break;
                    case keys.DELETE:
                        this.actions.remove(this.list.getSelectedEntry(), this.list.getSelectedIndex(), ev);
                        event.stop(ev);
                        break;
                    case keys.F2:
                        this.actions.rename(this.getSelectedEntry(), this.getSelectedIndex());
                        event.stop(ev);
                        break;
                    case 69: //The letter e for edit.
                        this.actions.action("edit", this.list.selectedIndex, ev);
                        event.stop(ev);
                        break;
                    case 65: //The letter a for administer
                        this.actions.action("admin", this.list.selectedIndex, ev);
                        event.stop(ev);
                        break;
                    case 67: //The letter c for comment
                        this.actions.action("comment", this.list.selectedIndex, ev);
                        event.stop(ev);
                        break;
                }
            }
        }
    });
});