"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var LeafLayerBase = (function () {
    function LeafLayerBase() {
    }
    LeafLayerBase.prototype.getName = function () {
        return this.name;
    };
    LeafLayerBase.prototype.addToMap = function (m, bls, dls) {
        var l = this.getLayer();
        m.addLayer(l);
        if (this.isBase())
            bls[this.getName()] = l;
        else
            dls[this.getName()] = l;
    };
    return LeafLayerBase;
}());
exports.LeafLayerBase = LeafLayerBase;
/**
 * Marker for Marker Layer
 * @param lon: Longitude of the marker
 */
var Marker = (function () {
    function Marker(parent) {
        this.parent = parent;
        this.datachange = new EventEmitter();
    }
    Object.defineProperty(Marker.prototype, "geo_data", {
        set: function (value) {
            if (value) {
                this.data = value;
                this.parent.redraw();
            }
        },
        enumerable: true,
        configurable: true
    });
    Marker.prototype.addMarker = function (lyr) {
        var m = this.get_marker();
        if (m != null) {
            lyr.addLayer(m);
            m.openPopup();
        }
    };
    Marker.prototype.get_marker = function () {
        if (this.data == null) {
            if (this.lat !== undefined)
                return L.marker([this.lat, this.lon]);
            else
                return null;
        }
        else {
            if (this.data.geometry) {
                if (this.data.geometry.coordinates[0] != 0) {
                    var pop = "<div><h3>" + this.data.properties.RagioneSociale + "</h3><p>" + this.data.properties.Indirizzo + ", " + this.data.properties.Frazione + " " + this.data.properties.Comune + "</p></div>";
                    return L.marker(this.data.geometry.coordinates).bindPopup(pop).openPopup();
                }
            }
        }
    };
    __decorate([
        Input()
    ], Marker.prototype, "lon");
    __decorate([
        Input()
    ], Marker.prototype, "lat");
    __decorate([
        Input()
    ], Marker.prototype, "icon");
    __decorate([
        Input()
    ], Marker.prototype, "color");
    __decorate([
        Input()
    ], Marker.prototype, "size");
    __decorate([
        Input()
    ], Marker.prototype, "data");
    __decorate([
        Input()
    ], Marker.prototype, "geo_data");
    __decorate([
        Output()
    ], Marker.prototype, "datachange");
    Marker = __decorate([
        core_1.Directive({
            selector: '[marker]'
        }),
        __param(0, Inject(forwardRef(function () { return MarkerLayer; })))
    ], Marker);
    return Marker;
}());
exports.Marker = Marker;
/**
 * Marker Layer
 * @param lon: Longitude of the marker
 */
var MarkerLayer = (function (_super) {
    __extends(MarkerLayer, _super);
    function MarkerLayer() {
        _super.apply(this, arguments);
    }
    MarkerLayer.prototype.getLayer = function () {
        this.layer = new L.FeatureGroup();
        this.redraw();
        return this.layer;
    };
    MarkerLayer.prototype.redraw = function () {
        var _this = this;
        this.layer.clearLayers();
        this.dataLayers.forEach(function (element) {
            element.addMarker(_this.layer);
        });
    };
    MarkerLayer.prototype.isBase = function () {
        return false;
    };
    __decorate([
        Input()
    ], MarkerLayer.prototype, "name");
    __decorate([
        ContentChildren(Marker)
    ], MarkerLayer.prototype, "dataLayers");
    MarkerLayer = __decorate([
        core_1.Directive({
            selector: '[markers]'
        })
    ], MarkerLayer);
    return MarkerLayer;
}(LeafLayerBase));
exports.MarkerLayer = MarkerLayer;
/**
 * Tile Layer
 * @param lon: Longitude of the marker
 */
var MapboxLayer = (function (_super) {
    __extends(MapboxLayer, _super);
    function MapboxLayer() {
        _super.apply(this, arguments);
        this.minzoom = 1;
        this.maxzoom = 20;
    }
    MapboxLayer.prototype.getLayer = function () {
        var url = "https://api.mapbox.com/styles/v1/" + this.owner + "/" + this.id + "/tiles/256/{z}/{x}/{y}?access_token=" + this.token;
        console.log(url);
        var attribution = "";
        return new L.TileLayer(url, { minZoom: this.minzoom, maxZoom: this.maxzoom, attribution: attribution });
    };
    MapboxLayer.prototype.isBase = function () {
        return true;
    };
    __decorate([
        Input()
    ], MapboxLayer.prototype, "name");
    __decorate([
        Input()
    ], MapboxLayer.prototype, "owner");
    __decorate([
        Input()
    ], MapboxLayer.prototype, "id");
    __decorate([
        Input()
    ], MapboxLayer.prototype, "token");
    __decorate([
        Input()
    ], MapboxLayer.prototype, "minzoom");
    __decorate([
        Input()
    ], MapboxLayer.prototype, "maxzoom");
    MapboxLayer = __decorate([
        core_1.Directive({
            selector: '[mapboxlayer]'
        })
    ], MapboxLayer);
    return MapboxLayer;
}(LeafLayerBase));
exports.MapboxLayer = MapboxLayer;
/**
 * Tile Layer
 * @param lon: Longitude of the marker
 */
var BaseLayer = (function (_super) {
    __extends(BaseLayer, _super);
    function BaseLayer() {
        _super.apply(this, arguments);
        this.minzoom = 1;
        this.maxzoom = 20;
    }
    BaseLayer.prototype.getLayer = function () {
        return new L.TileLayer(this.url, { minZoom: this.minzoom, maxZoom: this.maxzoom, attribution: this.attribution });
    };
    BaseLayer.prototype.isBase = function () {
        return true;
    };
    __decorate([
        Input()
    ], BaseLayer.prototype, "name");
    __decorate([
        Input()
    ], BaseLayer.prototype, "url");
    __decorate([
        Input()
    ], BaseLayer.prototype, "attribution");
    __decorate([
        Input()
    ], BaseLayer.prototype, "minzoom");
    __decorate([
        Input()
    ], BaseLayer.prototype, "maxzoom");
    BaseLayer = __decorate([
        core_1.Directive({
            selector: '[tilelayer]'
        })
    ], BaseLayer);
    return BaseLayer;
}(LeafLayerBase));
exports.BaseLayer = BaseLayer;
/**
 * Standard Tile Layer
 * @param name: one of "osm", "bing", "google", ""
 */
var NamedLayer = (function (_super) {
    __extends(NamedLayer, _super);
    function NamedLayer() {
        _super.apply(this, arguments);
        this.configs = {
            osms: { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors", minzoom: 1, maxzoom: 19 },
            osm: { name: "OpenStreetMap", url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors", minzoom: 1, maxzoom: 19 },
            positron: { name: "Carto Positron", url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>', minzoom: 1, maxzoom: 19 },
            darkmatter: { name: "Carto Positron", url: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>', minzoom: 1, maxzoom: 19 }
        };
    }
    NamedLayer.prototype.getLayer = function () {
        if (Object.keys(this.configs).indexOf(this.layer) >= 0) {
            var lyr = this.configs[this.layer];
            return new L.TileLayer(lyr.url, { minZoom: lyr.minzoom, maxZoom: lyr.maxzoom, attribution: lyr.attribution });
        }
        return null;
    };
    NamedLayer.prototype.isBase = function () {
        return true;
    };
    NamedLayer.prototype.getName = function () {
        if (this.layer in this.configs) {
            return this.configs[this.layer].name;
        }
        return "";
    };
    __decorate([
        Input()
    ], NamedLayer.prototype, "layer");
    NamedLayer = __decorate([
        core_1.Directive({
            selector: '[namedlayer]'
        })
    ], NamedLayer);
    return NamedLayer;
}(LeafLayerBase));
exports.NamedLayer = NamedLayer;
var DataLayer = (function (_super) {
    __extends(DataLayer, _super);
    function DataLayer(http) {
        _super.call(this);
        this.http = http;
        this.basestyle = {};
        this.propertystyle = {};
        this.areaclick = new EventEmitter();
    }
    DataLayer.prototype.the_style = function (basestyle, styledproperty, propertystyle) {
        return function (feature) {
            var gstyle = basestyle;
            var v = feature.properties[styledproperty];
            var astyle = propertystyle[v];
            Object.assign(gstyle, astyle);
            return gstyle;
        };
    };
    DataLayer.prototype.getLayer = function () {
        var _this = this;
        if (this.type == "geojson")
            return new Promise(function (resolve, react) {
                _this.http.get(_this.aggregator).toPromise().then(function (x) {
                    console.log(x);
                    resolve(new L.GeoJSON(x.json(), {
                        style: _this.the_style(_this.basestyle, _this.styledproperty, _this.propertystyle),
                        onEachFeature: function (feature, lyr) {
                            lyr.on({
                                click: function (e) {
                                    _this.areaclick.emit({
                                        field: feature.properties[_this.field],
                                        feature: feature
                                    });
                                }
                            });
                        }
                    }));
                });
            });
        return null;
    };
    DataLayer.prototype.isBase = function () {
        return false;
    };
    DataLayer.prototype.addToMap = function (m, bls, dls) {
        this.getLayer().then(function (x) {
            m.addLayer(x);
            dls.push(x);
        });
    };
    __decorate([
        Input()
    ], DataLayer.prototype, "type");
    __decorate([
        Input()
    ], DataLayer.prototype, "mode");
    __decorate([
        Input()
    ], DataLayer.prototype, "src");
    __decorate([
        Input()
    ], DataLayer.prototype, "aggregator");
    __decorate([
        Input()
    ], DataLayer.prototype, "field");
    __decorate([
        Input()
    ], DataLayer.prototype, "basestyle");
    __decorate([
        Input()
    ], DataLayer.prototype, "propertystyle");
    __decorate([
        Input()
    ], DataLayer.prototype, "styledproperty");
    __decorate([
        Output()
    ], DataLayer.prototype, "areaclick");
    DataLayer = __decorate([
        core_1.Directive({
            selector: '[datalayer]'
        })
    ], DataLayer);
    return DataLayer;
}(LeafLayerBase));
exports.DataLayer = DataLayer;
var MnMapComponent = (function () {
    function MnMapComponent(elementRef) {
        this.elementRef = elementRef;
        this.center = [51.505, -0.09];
        this.minzoom = 0;
        this.maxzoom = 20;
        this.startzoom = 13;
        this.click = new EventEmitter();
        this.movestart = new EventEmitter();
        this.moveend = new EventEmitter();
        this.layers = [];
        this.grid_unit = 170;
        this.grid_gutter = 15;
        if (this.map_id == null)
            this.map_id = this.makeid();
    }
    MnMapComponent.prototype.makeid = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    MnMapComponent.prototype.addLayer = function (layer) {
        this.layers.push(layer);
    };
    MnMapComponent.prototype.prepareLayers = function () {
        var _this = this;
        this.baseLayers.forEach(function (element) {
            _this.addLayer(element);
        });
        this.namedLayers.forEach(function (element) {
            _this.addLayer(element);
        });
        this.dataLayers.forEach(function (element) {
            _this.addLayer(element);
        });
        this.markerLayers.forEach(function (element) {
            _this.addLayer(element);
        });
        this.mapboxLayers.forEach(function (element) {
            _this.addLayer(element);
        });
    };
    MnMapComponent.prototype.ngAfterContentChecked = function () {
        try {
            this.map = L.map(this.map_id, { minZoom: this.minzoom, maxZoom: this.maxzoom }).setView(this.center, this.startzoom);
            this.prepareLayers();
            var bls = [];
            var dls = [];
            for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                var lyr = _a[_i];
                lyr.addToMap(this.map, bls, dls);
            }
            L.control.layers(bls, dls).addTo(this.map);
        }
        catch (ex) {
        }
    };
    __decorate([
        Input()
    ], MnMapComponent.prototype, "conf");
    __decorate([
        Input()
    ], MnMapComponent.prototype, "map_id");
    __decorate([
        Input()
    ], MnMapComponent.prototype, "center");
    __decorate([
        Input()
    ], MnMapComponent.prototype, "minzoom");
    __decorate([
        Input()
    ], MnMapComponent.prototype, "maxzoom");
    __decorate([
        Input()
    ], MnMapComponent.prototype, "startzoom");
    __decorate([
        ContentChildren(BaseLayer)
    ], MnMapComponent.prototype, "baseLayers");
    __decorate([
        ContentChildren(NamedLayer)
    ], MnMapComponent.prototype, "namedLayers");
    __decorate([
        ContentChildren(DataLayer)
    ], MnMapComponent.prototype, "dataLayers");
    __decorate([
        ContentChildren(MarkerLayer)
    ], MnMapComponent.prototype, "markerLayers");
    __decorate([
        ContentChildren(MapboxLayer)
    ], MnMapComponent.prototype, "mapboxLayers");
    __decorate([
        Output()
    ], MnMapComponent.prototype, "click");
    __decorate([
        Output()
    ], MnMapComponent.prototype, "movestart");
    __decorate([
        Output()
    ], MnMapComponent.prototype, "moveend");
    MnMapComponent = __decorate([
        core_1.Component({
            selector: '[mn-map]',
            templateUrl: './mn-map.component.html',
            styleUrls: ['./mn-map.component.css']
        })
    ], MnMapComponent);
    return MnMapComponent;
}());
exports.MnMapComponent = MnMapComponent;
/// <reference path="../../../typings/leaflet/leaflet.d.ts" />
