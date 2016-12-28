/// <reference path="../../../typings/index.d.ts" />

import { ViewChild, ContentChildren,OnInit, Inject, forwardRef,  Component,Directive, AfterViewInit, Input, Output, EventEmitter, QueryList, ElementRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BackendManagerService } from '../backend-manager.service'
import 'rxjs/add/operator/toPromise';


/**
 * Prepresents the generic layer
 */
export interface LeafLayer{
  getLayer():L.Layer|Promise<L.Layer>;
  addToMap(m, bls, dls);
  getName():string;
  isBase():boolean;
}

export abstract class LeafLayerBase implements LeafLayer{
  abstract getLayer():L.Layer|Promise<L.Layer>;
  abstract isBase():boolean;

  protected name:string;
  getName():string{
    return this.name;
  }
  addToMap(m, bls, dls){
    let l = this.getLayer();
    m.addLayer(l);
    if(this.isBase())
      bls[this.getName()] = l;
    else
      dls[this.getName()] = l;
  }
}

/**
 * Marker for Marker Layer
 * @param lon: Longitude of the marker
 */
@Directive({
  selector: '[marker]',
})
export class Marker{
  @Input() lon:number;
  @Input() lat:number;
  @Input() icon:string;
  @Input() color:string;
  @Input() size:string;
  
  @Input() data:any;
  @Input() set geo_data(value){
    if (value){
      this.data = value;
      this.parent.redraw();
    }
  }
  @Output() datachange = new EventEmitter<any>();

  constructor(@Inject(forwardRef(() => MarkerLayer)) private parent:MarkerLayer){}

  addMarker(lyr){
    let m = this.get_marker();
    if (m != null){
      lyr.addLayer(m);
      m.openPopup();
    }
  }
  
  get_marker(){

    if (this.data == null){
      if (this.lat !== undefined)
        return L.marker([this.lat, this.lon]);
      else return null;
    } else {
      if (this.data.geometry) {
        if (this.data.geometry.coordinates[0] != 0) {
          let pop = "<div><h3>"+this.data.properties.RagioneSociale+"</h3><p>"+this.data.properties.Indirizzo+", "+this.data.properties.Frazione + " "+this.data.properties.Comune+"</p></div>";
          return L.marker(this.data.geometry.coordinates).bindPopup(pop).openPopup();
        }
      }
    }
  }
} 

/**
 * Marker Layer 
 * @param lon: Longitude of the marker
 */
@Directive({
  selector: '[markers]',
})
export class MarkerLayer extends LeafLayerBase{
  @Input() name:string;
  @ContentChildren(Marker) dataLayers: QueryList<Marker>;
  
  layer;
  
  getLayer(){
    this.layer =  L.featureGroup();
    this.redraw();
    return this.layer;
  }
  
  redraw(){
    this.layer.clearLayers();
    this.dataLayers.forEach(element => {
      element.addMarker(this.layer);
    });
  }
  
  isBase(){
    return false;
  }
} 

/**
 * Tile Layer 
 * @param lon: Longitude of the marker
 */
@Directive({
  selector: 'mapboxlayer',
})
export class MapboxLayer extends LeafLayerBase{
  @Input() name:string;
  @Input() owner:string;
  @Input() id:string;
  @Input() token:string;
  @Input() minzoom:number = 1;
  @Input() maxzoom:number = 20;

  getLayer(){
    let url = "https://api.mapbox.com/styles/v1/"+this.owner+"/"+this.id+"/tiles/256/{z}/{x}/{y}?access_token="+this.token;
    console.log(url);
    let attribution = "";
    return L.tileLayer(url, {minZoom: this.minzoom, maxZoom: this.maxzoom, attribution: attribution});
  }
  isBase(){
    return true;
  }
} 


/**
 * Tile Layer 
 * @param lon: Longitude of the marker
 */
@Directive({
  selector: 'tile_layer',
})
export class BaseLayer extends LeafLayerBase{
  @Input() name:string;
  @Input() url:string;
  @Input() attribution:string;
  @Input() minzoom:number = 1;
  @Input() maxzoom:number = 20;

  getLayer(){
    return L.tileLayer(this.url, {minZoom: this.minzoom, maxZoom: this.maxzoom, attribution: this.attribution});
  }
  isBase(){
    return true;
  }
} 

/**
 * Standard Tile Layer 
 * @param name: one of "osm", "bing", "google", ""
 */
@Directive({
  selector: 'namedlayer',
})
export class NamedLayer extends LeafLayerBase {
  @Input() layer:string;

  configs = {
    osms:{name:"OpenStreetMap", url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution:"Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors", minzoom:1, maxzoom:19},
    osm:{name:"OpenStreetMap", url:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution:"Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors", minzoom:1, maxzoom:19},
    positron:{name:"Carto Positron", url:"http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>', minzoom:1, maxzoom:19},
    darkmatter:{name:"Carto Positron", url:"http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>', minzoom:1, maxzoom:19},
  };

  getLayer(){
    if(Object.keys(this.configs).indexOf(this.layer) >= 0){
      let lyr = this.configs[this.layer];
      return L.tileLayer(lyr.url, {minZoom: lyr.minzoom, maxZoom: lyr.maxzoom, attribution: lyr.attribution});
    }
    return null;
  } 
  isBase(){
    return true;
  }
  getName(){
    if(this.layer in this.configs){
      return this.configs[this.layer].name;
    }
    return "";
  }
} 

@Directive({
  selector: 'datalayer',
})
export class DataLayer extends LeafLayerBase {
  @Input() type:string;
  @Input() mode:string;
  @Input() src:string;
  @Input() aggregator:string;
  @Input() field:string;

  @Input() basestyle:any={};
  @Input() propertystyle:any={};
  @Input() styledproperty:string;
  
  @Output() areaclick = new EventEmitter<any>();

  constructor(private http:Http){
    super();
  }

  the_style(basestyle, styledproperty, propertystyle){
    return function(feature){
      let gstyle = basestyle;
      let v = feature.properties[styledproperty];
      let astyle = propertystyle[v];
      Object.assign(gstyle, astyle);
      return gstyle;
    }
  }
  
  getLayer():Promise<L.Layer>{
    if (this.type == "geojson")
      return new Promise<L.Layer>((resolve, react) =>{
        this.http.get(this.aggregator).toPromise().then(x=>{
          console.log(x);
          resolve(L.geoJSON(x.json(), {
            style:this.the_style(this.basestyle, this.styledproperty, this.propertystyle),
            onEachFeature:(feature, lyr) => {
              lyr.on({
                click:(e)=>{
                  this.areaclick.emit({
                    field:feature.properties[this.field], 
                    feature:feature
                  });
                }
              });
            }
          }));
        });
      });
    return null;
  } 
  isBase(){
    return false;
  }
  addToMap(m, bls, dls){
    this.getLayer().then(x=>{
      m.addLayer(x);
      dls.push(x);
    });
  }
} 


/**
 * Tile Layer 
 * @param lon: Longitude of the marker
 */
@Directive({
  selector: 'cityosbglayer',
})
export class CityOSBackgroundLayer extends LeafLayerBase{
  @Input() conf:any;
  
  name:string;
  url:string;
  attribution:string;
  minzoom:number = 1;
  maxzoom:number = 20;

  ngOnInit(){
    this.name = this.conf.name;
    this.url = this.conf.url;
    this.attribution = this.conf.attribution;
  }

  getLayer(){
    return L.tileLayer(this.url, {minZoom: this.minzoom, maxZoom: this.maxzoom, attribution: this.attribution});
  }
  isBase(){
    return true;
  }
} 

@Directive({
  selector: 'cityoslayer',
})
export class CityOSLayer extends LeafLayerBase {
  @Input() mappingSpace:number;
  
  @Output() itemclick = new EventEmitter<any>();

  items;
  styles;

  int_styles = {}

  constructor(private bms:BackendManagerService){
    super();
  }
  
  getLayer():Promise<L.Layer>{
    return new Promise<L.Layer>((resolve, react) =>{
      this.bms.setPaging(false).setActiveApp("spaces/"+this.mappingSpace+"/styles").getAll().then(s=>{
        this.styles = s;
        for(let style of this.styles){
          this.int_styles[style.slug] = style;
        }
        console.log(this.int_styles);
        this.bms.setPaging(false).setActiveApp("spaces/"+this.mappingSpace+"/geolocations").getAll().then(x=>{
          console.log(x);
          let geoj = L.geoJSON(x , {
            style:(feature =>{
              return this.int_styles[feature.properties.types[0]];
            }),
          });
          resolve( geoj );
        });
      });
    });
  } 
  isBase(){
    return false;
  }
  addToMap(m, bls, dls){
    this.getLayer().then(x=>{
      m.addLayer(x);
      dls["CityOS"] = x;
    });
  }
} 

@Component({
  selector: '[mn-map]',
  templateUrl: './mn-map.component.html',
  styleUrls: ['./mn-map.component.css'],
})
export class MnMapComponent {


  private makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i=0; i < 5; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  }
  
  @Input() conf:any;
  @Input() map_id:string;
  
  @Input() center:number[] = [51.505,-0.09];
  @Input() minzoom:number = 0;
  @Input() maxzoom:number = 20;
  @Input() startzoom:number = 13;
  
  @Input() controls = true;
  @Input() scrollZoom = false;
  @Input() zoomControl = true;
  
  @ContentChildren(BaseLayer) baseLayers: QueryList<LeafLayer>;
  @ContentChildren(NamedLayer) namedLayers: QueryList<LeafLayer>;
  @ContentChildren(DataLayer) dataLayers: QueryList<LeafLayer>;
  @ContentChildren(MarkerLayer) markerLayers: QueryList<LeafLayer>;
  @ContentChildren(CityOSLayer) cityoslayer: QueryList<LeafLayer>;
  @ContentChildren(CityOSBackgroundLayer) cityosbglayer: QueryList<LeafLayer>;
  @ContentChildren(MapboxLayer) mapboxLayers: QueryList<LeafLayer>;

  @Output() click:EventEmitter<any> = new EventEmitter();
  @Output() movestart:EventEmitter<any> = new EventEmitter();
  @Output() moveend:EventEmitter<any> = new EventEmitter();
 
  public map;
  
  layers:Array<LeafLayer> = [];

  private addLayer(layer:LeafLayer){
    this.layers.push(layer);
  }
  
  
  grid_unit:number = 170;
  grid_gutter:number = 15;
 
  constructor(private elementRef: ElementRef){
     if(this.map_id == null)
      this.map_id = this.makeid();
  }

  protected prepareLayers(){
    this.baseLayers.forEach(element => {
      this.addLayer(element);
    });
	  this.namedLayers.forEach(element => {
      this.addLayer(element);
    });
    this.dataLayers.forEach(element => {
      this.addLayer(element);
    });
    this.markerLayers.forEach(element => {
      this.addLayer(element);
    });
    this.mapboxLayers.forEach(element => {
      this.addLayer(element);
    });
    this.cityoslayer.forEach(element => {
      this.addLayer(element);
    });
    this.cityosbglayer.forEach(element => {
      this.addLayer(element);
    });
  }

  ngAfterViewInit() {
    try{
      this.map = L.map(this.map_id, {
        minZoom:this.minzoom, 
        maxZoom:this.maxzoom, 
        scrollWheelZoom:this.scrollZoom,
        zoomControl: this.zoomControl
      }).setView([this.center[0], this.center[1]], this.startzoom);
      
      this.prepareLayers();
  
      let bls = {};
      let dls = {};
  
      for(let lyr of this.layers){
        lyr.addToMap(this.map, bls, dls);
      }
      this.map._onResize(); 
  
      if(this.controls)
        L.control.layers(bls, dls).addTo(this.map);
    } catch (ex){
      console.log(ex);
    }
  }
}

