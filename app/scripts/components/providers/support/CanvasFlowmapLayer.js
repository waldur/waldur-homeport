import TWEEN from '@tweenjs/tween.js/src/Tween';

/*eslint-disable */

(function(factory, window) {
    // module loaders support for LeafletJS plugins, see:
    // https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md#module-loaders

    // AMD module that relies on "leaflet"
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

        // Common JS module that relies on "leaflet"
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach plugin to the global leaflet "L" variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.CanvasFlowmapLayer = factory(L);

        window.L.canvasFlowmapLayer = function(originAndDestinationGeoJsonPoints, opts) {
            return new window.L.CanvasFlowmapLayer(originAndDestinationGeoJsonPoints, opts);
        };
    }
}(function(L) {
    // layer source code
  let canvasRenderer = L.canvas();

  let CanvasFlowmapLayer = L.GeoJSON.extend({
    options: {
    // this is only a default option example,
    // developers will most likely need to provide this
    // options object with values unique to their data
      originAndDestinationFieldIds: {
        originUniqueIdField: 'origin_id',
        originGeometry: {
          x: 'origin_lon',
          y: 'origin_lat'
        },
        destinationUniqueIdField: 'destination_id',
        destinationGeometry: {
          x: 'destination_lon',
          y: 'destination_lat'
        }
      },

      canvasBezierStyle: {
        type: 'simple',
        symbol: {
          // use canvas styling options (compare to CircleMarker styling below)
          strokeStyle: '#c9302c',
          lineWidth: 0.75,
          lineCap: 'round',
          shadowColor: '#c9302c',
          shadowBlur: 1.5
        }
      },

      animatedCanvasBezierStyle: {
        type: 'simple',
        symbol: {
          // use canvas styling options (compare to CircleMarker styling below)
          strokeStyle: '#ed5565',
          lineWidth: 1.5,
          lineDashOffsetSize: 4, // custom property used with animation sprite sizes
          lineCap: 'round',
          shadowColor: '#ed5565',
          shadowBlur: 4
        }
      },

        // valid values: 'selection' or 'all'
        // use 'all' to display all Bezier paths immediately
        // use 'selection' if Bezier paths will be drawn with user interactions
        pathDisplayMode: 'all',

        wrapAroundCanvas: true,

        animationStarted: false,

        animationEasingFamily: 'Cubic',

        animationEasingType: 'In',

        animationDuration: 2000,

        pointToLayer: function(geoJsonPoint, latlng) {
            var marker = L.circleMarker(latlng);
            if (!geoJsonPoint.properties.isOrigin) {
                marker.bindPopup();
            }
            return marker;
        },

        style: function(geoJsonFeature) {
            // use leaflet's path styling options

            // since the GeoJSON feature properties are modified by the layer,
            // developers can rely on the "isOrigin" property to set different
            // symbols for origin vs destination CircleMarker stylings

            if (geoJsonFeature.properties.isOrigin) {
                return {
                    renderer: canvasRenderer, // recommended to use L.canvas()
                    radius: 5,
                    weight: 1,
                    color: '#1ab394',
                    fillColor: '#1ab394',
                    fillOpacity: 0.6
                };
            } else {
                return {
                    renderer: canvasRenderer,
                    radius: 2.5,
                    weight: 0.25,
                    color: '#f8ac59',
                    fillColor: '#f8ac59',
                    fillOpacity: 0.7
                };
            }
        }
    },

        _customCanvases: [],

        initialize: function(geoJson, options) {
            // same as L.GeoJSON intialize method, but first performs custom GeoJSON
            // data parsing and reformatting before finally calling L.GeoJSON addData method
            L.setOptions(this, options);

            this._animationPropertiesStatic = {
                offset: 0,
                resetOffset: 200,
                repeat: Infinity,
                yoyo: false
            };

            this._animationPropertiesDynamic = {
                duration: null,
                easingInfo: null
            };

            this._layers = {};

            // beginning of customized initialize method
            if (geoJson && this.options.originAndDestinationFieldIds) {
                this.setOriginAndDestinationGeoJsonPoints(geoJson);
            }

            // establish animation properties using Tween.js library
            // currently requires the developer to add it to their own app index.html
            // TODO: find better way to wrap it up in this layer source code
            if (TWEEN) {
                // set this._animationPropertiesDynamic.duration value
                this.setAnimationDuration(this.options.animationDuration);
                // set this._animationPropertiesDynamic.easingInfo value
                this.setAnimationEasing(this.options.animationEasingFamily, this.options.animationEasingType);

                // initiate the active animation tween
                this._animationTween = new TWEEN.Tween(this._animationPropertiesStatic)
                    .to({
                        offset: this._animationPropertiesStatic.resetOffset
                    }, this._animationPropertiesDynamic.duration)
                    .easing(this._animationPropertiesDynamic.easingInfo.tweenEasingFunction)
                    .repeat(this._animationPropertiesStatic.repeat)
                    .yoyo(this._animationPropertiesStatic.yoyo)
                    .start();
            } else {
                // Tween.js lib isn't available,
                // ensure that animations aren't attempted at the beginning
                this.options.animationStarted = false;
            }
        },

        setOriginAndDestinationGeoJsonPoints: function(geoJsonFeatureCollection) {
            if (geoJsonFeatureCollection.features) {
                var configOriginGeometryObject = this.options.originAndDestinationFieldIds.originGeometry;
                var configDestinationGeometryObject = this.options.originAndDestinationFieldIds.destinationGeometry;

                geoJsonFeatureCollection.features.forEach(function(feature, index) {
                    if (feature.type === 'Feature' && feature.geometry && feature.geometry.type === 'Point') {
                        // origin feature -- modify attribute properties and geometry
                        feature.properties.isOrigin = true;
                        feature.properties._isSelectedForPathDisplay = this.options.pathDisplayMode === 'all' ? true : false;
                        feature.properties._uniqueId = index + '_origin';

                        feature.geometry.coordinates = [
                            feature.properties[configOriginGeometryObject.x],
                            feature.properties[configOriginGeometryObject.y]
                        ];

                        // destination feature -- clone, modify, and push to feature collection
                        var destinationFeature = JSON.parse(JSON.stringify(feature));

                        destinationFeature.properties.isOrigin = false;
                        destinationFeature.properties._isSelectedForPathDisplay = false;
                        destinationFeature.properties._uniqueId = index + '_destination';

                        destinationFeature.geometry.coordinates = [
                            destinationFeature.properties[configDestinationGeometryObject.x],
                            destinationFeature.properties[configDestinationGeometryObject.y]
                        ];

                        geoJsonFeatureCollection.features.push(destinationFeature);
                    }
                }, this);

                // all origin/destination features are available for future internal used
                // but only a filtered subset of these are drawn on the map
                this.originAndDestinationGeoJsonPoints = geoJsonFeatureCollection;
                var geoJsonPointsToDraw = this._filterGeoJsonPointsToDraw(geoJsonFeatureCollection);
                this.addData(geoJsonPointsToDraw);
            } else {
                // TODO: improved handling of invalid incoming GeoJson FeatureCollection?
                this.originAndDestinationGeoJsonPoints = null;
            }

            return this;
        },

        onAdd: function(map) {
            // call the L.GeoJSON onAdd method,
            // then continue with custom code
            L.GeoJSON.prototype.onAdd.call(this, map);

            // create new canvas element for optional, animated bezier curves
            this._animationCanvasElement = this._insertCustomCanvasElement(map, this.options);

            // create new canvas element for manually drawing bezier curves
            //  - most of the magic happens in this canvas element
            //  - this canvas element is established last because it will be
            //    inserted before (underneath) the animation canvas element
            this._canvasElement = this._insertCustomCanvasElement(map, this.options);

            // create a reference to both canvas elements in an array for convenience
            this._customCanvases = [this._canvasElement, this._animationCanvasElement]

            // establish custom event listeners
            this.on('click mouseover', this._modifyInteractionEvent, this);
            map.on('move', this._resetCanvas, this);
            map.on('moveend', this._resetCanvasAndWrapGeoJsonCircleMarkers, this);
            map.on('resize', this._resizeCanvas, this);
            if (map.options.zoomAnimation && L.Browser.any3d) {
                map.on('zoomanim', this._animateZoom, this);
            }

            // calculate initial size and position of canvas
            // and draw its content for the first time
            this._resizeCanvas();
            this._resetCanvasAndWrapGeoJsonCircleMarkers();

            return this;
        },

        onRemove: function(map) {
            // call the L.GeoJSON onRemove method,
            // then continue with custom code
            L.GeoJSON.prototype.onRemove.call(this, map);

            this._clearCanvas();

            this._customCanvases.forEach(function(canvas) {
                L.DomUtil.remove(canvas);
            });

            // remove custom event listeners
            this.off('click mouseover', this._modifyInteractionEvent, this);
            map.off('move', this._resetCanvas, this);
            map.off('moveend', this._resetCanvasAndWrapGeoJsonCircleMarkers, this);
            map.off('resize', this._resizeCanvas, this);
            if (map.options.zoomAnimation) {
                map.off('zoomanim', this._animateZoom, this);
            }

            return this;
        },

        bringToBack: function() {
            // call the L.GeoJSON bringToBack method to manage the point graphics
            L.GeoJSON.prototype.bringToBack.call(this);

            // keep the animation canvas element on top of the main canvas element
            L.DomUtil.toBack(this._animationCanvasElement);

            // keep the main canvas element underneath the animation canvas element
            L.DomUtil.toBack(this._canvasElement);

            return this;
        },

        bringToFront: function() {
            // keep the main canvas element underneath the animation canvas element
            L.DomUtil.toFront(this._canvasElement);

            // keep the animation canvas element on top of the main canvas element
            L.DomUtil.toFront(this._animationCanvasElement);

            // call the L.GeoJSON bringToFront method to manage the point graphics
            L.GeoJSON.prototype.bringToFront.call(this);

            return this;
        },

        setAnimationDuration: function(milliseconds) {
            milliseconds = Number(milliseconds) || this.options.animationDuration;

            // change the tween duration on the active animation tween
            if (this._animationTween) {
                this._animationTween.to({
                    offset: this._animationPropertiesStatic.resetOffset
                }, milliseconds);
            }

            this._animationPropertiesDynamic.duration = milliseconds;
        },

        setAnimationEasing: function(easingFamily, easingType) {
            var tweenEasingFunction;
            if (
                TWEEN.Easing.hasOwnProperty(easingFamily) &&
                TWEEN.Easing[easingFamily].hasOwnProperty(easingType)
            ) {
                tweenEasingFunction = TWEEN.Easing[easingFamily][easingType];
            } else {
                easingFamily = this.options.animationEasingFamily;
                easingType = this.options.animationEasingType;
                tweenEasingFunction = TWEEN.Easing[easingFamily][easingType];
            }

            // change the tween easing function on the active animation tween
            if (this._animationTween) {
                this._animationTween.easing(tweenEasingFunction);
            }

            this._animationPropertiesDynamic.easingInfo = {
                easingFamily: easingFamily,
                easingType: easingType,
                tweenEasingFunction: tweenEasingFunction
            };
        },

        getAnimationEasingOptions: function(prettyPrint) {
            var tweenEasingConsoleOptions = {};
            var tweenEasingOptions = {};

            Object.keys(TWEEN.Easing).forEach(function(family) {
                tweenEasingConsoleOptions[family] = {
                    types: Object.keys(TWEEN.Easing[family]).join('", "')
                };

                tweenEasingOptions[family] = {
                    types: Object.keys(TWEEN.Easing[family])
                };
            });

            if (!!prettyPrint) {
                console.table(tweenEasingConsoleOptions);
            }

            return tweenEasingOptions;
        },

        playAnimation: function() {
            this.options.animationStarted = true;
            this._redrawCanvas();
        },

        stopAnimation: function() {
            this.options.animationStarted = false;
            this._redrawCanvas();
        },

        selectFeaturesForPathDisplay: function(selectionFeatures, selectionMode) {
            this._applyFeaturesSelection(selectionFeatures, selectionMode, '_isSelectedForPathDisplay');
        },

        selectFeaturesForPathDisplayById: function(uniqueOriginOrDestinationIdField, idValue, originBoolean, selectionMode) {
            if (
                uniqueOriginOrDestinationIdField !== this.options.originAndDestinationFieldIds.originUniqueIdField &&
                uniqueOriginOrDestinationIdField !== this.options.originAndDestinationFieldIds.destinationUniqueIdField
            ) {
                console.error('Invalid unique id field supplied for origin or destination. It must be one of these: ' +
                    this.options.originAndDestinationFieldIds.originUniqueIdField + ', ' + this.options.originAndDestinationFieldIds.destinationUniqueIdField);
                return;
            }

            var existingOriginOrDestinationFeature = this.originAndDestinationGeoJsonPoints.features.filter(function(feature) {
                return feature.properties.isOrigin === originBoolean &&
                    feature.properties[uniqueOriginOrDestinationIdField] === idValue;
            })[0];

            var odInfo = this._getSharedOriginOrDestinationFeatures(existingOriginOrDestinationFeature);

            if (odInfo.isOriginFeature) {
                this.selectFeaturesForPathDisplay(odInfo.sharedOriginFeatures, selectionMode);
            } else {
                this.selectFeaturesForPathDisplay(odInfo.sharedDestinationFeatures, selectionMode);
            }
        },

        clearAllPathSelections: function() {
            this.originAndDestinationGeoJsonPoints.features.forEach(function(feature) {
                feature.properties._isSelectedForPathDisplay = false;
            });

            this._resetCanvas();
        },

        _filterGeoJsonPointsToDraw: function(geoJsonFeatureCollection) {
            var newGeoJson = {
                type: 'FeatureCollection',
                features: []
            };

            var originUniqueIdValues = [];
            var destinationUniqueIdValues = [];

            var originUniqueIdField = this.options.originAndDestinationFieldIds.originUniqueIdField;
            var destinationUniqueIdField = this.options.originAndDestinationFieldIds.destinationUniqueIdField;

            geoJsonFeatureCollection.features.forEach(function(feature) {
                var isOrigin = feature.properties.isOrigin;

                if (isOrigin && originUniqueIdValues.indexOf(feature.properties[originUniqueIdField]) === -1) {
                    originUniqueIdValues.push(feature.properties[originUniqueIdField]);
                    newGeoJson.features.push(feature);
                } else if (!isOrigin && destinationUniqueIdValues.indexOf(feature.properties[destinationUniqueIdField]) === -1) {
                    destinationUniqueIdValues.push(feature.properties[destinationUniqueIdField]);
                    newGeoJson.features.push(feature);
                } else {
                    // do not attempt to draw an origin or destination circle on the canvas if it is already in one of the tracking arrays
                    return;
                }
            });

            return newGeoJson;
        },

        _insertCustomCanvasElement: function(map, options) {
            var canvas = L.DomUtil.create('canvas', 'leaflet-zoom-animated');

            var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
            canvas.style[originProp] = '50% 50%';

            var pane = map.getPane(options.pane);
            pane.insertBefore(canvas, pane.firstChild);

            return canvas;
        },

        _modifyInteractionEvent: function(e) {
            var odInfo = this._getSharedOriginOrDestinationFeatures(e.layer.feature);
            e.isOriginFeature = odInfo.isOriginFeature;
            e.sharedOriginFeatures = odInfo.sharedOriginFeatures;
            e.sharedDestinationFeatures = odInfo.sharedDestinationFeatures;
        },

        _getSharedOriginOrDestinationFeatures: function(testFeature) {
            var isOriginFeature = testFeature.properties.isOrigin;
            var sharedOriginFeatures = [];
            var sharedDestinationFeatures = [];

            if (isOriginFeature) {
                // for an ORIGIN point that was interacted with,
                // make an array of all other ORIGIN features with the same ORIGIN ID field
                var originUniqueIdField = this.options.originAndDestinationFieldIds.originUniqueIdField;
                var testFeatureOriginId = testFeature.properties[originUniqueIdField];
                sharedOriginFeatures = this.originAndDestinationGeoJsonPoints.features.filter(function(feature) {
                    return feature.properties.isOrigin &&
                        feature.properties[originUniqueIdField] === testFeatureOriginId;
                });
            } else {
                // for a DESTINATION point that was interacted with,
                // make an array of all other ORIGIN features with the same DESTINATION ID field
                var destinationUniqueIdField = this.options.originAndDestinationFieldIds.destinationUniqueIdField;
                var testFeatureDestinationId = testFeature.properties[destinationUniqueIdField];
                sharedDestinationFeatures = this.originAndDestinationGeoJsonPoints.features.filter(function(feature) {
                    return feature.properties.isOrigin &&
                        feature.properties[destinationUniqueIdField] === testFeatureDestinationId;
                });
            }

            return {
                isOriginFeature: isOriginFeature, // Boolean
                sharedOriginFeatures: sharedOriginFeatures, // Array of features
                sharedDestinationFeatures: sharedDestinationFeatures // Array of features
            };
        },

        _applyFeaturesSelection: function(selectionFeatures, selectionMode, selectionAttributeName) {
            var selectionIds = selectionFeatures.map(function(feature) {
                return feature.properties._uniqueId;
            });

            if (selectionMode === 'SELECTION_NEW') {
                this.originAndDestinationGeoJsonPoints.features.forEach(function(feature) {
                    if (selectionIds.indexOf(feature.properties._uniqueId) > -1) {
                        feature.properties[selectionAttributeName] = true;
                    } else {
                        feature.properties[selectionAttributeName] = false;
                    }
                });
            } else if (selectionMode === 'SELECTION_ADD') {
                this.originAndDestinationGeoJsonPoints.features.forEach(function(feature) {
                    if (selectionIds.indexOf(feature.properties._uniqueId) > -1) {
                        feature.properties[selectionAttributeName] = true;
                    }
                });
            } else if (selectionMode === 'SELECTION_SUBTRACT') {
                this.originAndDestinationGeoJsonPoints.features.forEach(function(feature) {
                    if (selectionIds.indexOf(feature.properties._uniqueId) > -1) {
                        feature.properties[selectionAttributeName] = false;
                    }
                });
            } else {
                return;
            }

            this._resetCanvas();
        },

        _animateZoom: function(e) {
            // see: https://github.com/Leaflet/Leaflet.heat
            var scale = this._map.getZoomScale(e.zoom);
            var offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

            if (L.DomUtil.setTransform) {
                this._customCanvases.forEach(function(canvas) {
                    L.DomUtil.setTransform(canvas, offset, scale);
                });
            } else {
                this._customCanvases.forEach(function(canvas) {
                    canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
                });
            }
        },

        _resizeCanvas: function() {
            // update the canvas size
            var size = this._map.getSize();
            this._customCanvases.forEach(function(canvas) {
                canvas.width = size.x;
                canvas.height = size.y;
            });

            this._resetCanvas();
        },

        _resetCanvas: function() {
            // update the canvas position and redraw its content
            var topLeft = this._map.containerPointToLayerPoint([0, 0]);
            this._customCanvases.forEach(function(canvas) {
                L.DomUtil.setPosition(canvas, topLeft);
            });

            this._redrawCanvas();
        },

        _resetCanvasAndWrapGeoJsonCircleMarkers: function() {
            this._resetCanvas();
            // Leaflet will redraw a CircleMarker when its latLng is changed
            // sometimes they are drawn 2+ times if this occurs during many "move" events
            // so for now, only chang CircleMarker latlng after a single "moveend" event
            this._wrapGeoJsonCircleMarkers();
        },

        _redrawCanvas: function() {
            // draw canvas content (only the Bezier curves)
            if (this._map && this.originAndDestinationGeoJsonPoints) {
                this._clearCanvas();

                // loop over each of the "selected" features and re-draw the canvas paths
                this._drawSelectedCanvasPaths(false);

                if (this._animationFrameId) {
                    L.Util.cancelAnimFrame(this._animationFrameId);
                }

                if (
                    this.options.animationStarted &&
                    this.originAndDestinationGeoJsonPoints.features.some(function(feature) {
                        return feature.properties._isSelectedForPathDisplay;
                    })
                ) {
                    // start animation loop if the layer is currently set for showing animations,
                    // and if there is at least 1 feature selected for displaying paths
                    this._animator();
                }
            }
        },

        _clearCanvas: function() {
            this._customCanvases.forEach(function(canvas) {
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            });

            if (this._animationFrameId) {
                L.Util.cancelAnimFrame(this._animationFrameId);
            }
        },

        _drawSelectedCanvasPaths: function(animate) {
            var ctx = animate ?
                this._animationCanvasElement.getContext('2d') :
                this._canvasElement.getContext('2d');

            if (animate) {
                ctx.beginPath();
            }

            var originAndDestinationFieldIds = this.options.originAndDestinationFieldIds;

            this.originAndDestinationGeoJsonPoints.features.forEach(function(feature) {

                if (feature.properties._isSelectedForPathDisplay) {
                    var originXCoordinate = feature.properties[originAndDestinationFieldIds.originGeometry.x];
                    var originYCoordinate = feature.properties[originAndDestinationFieldIds.originGeometry.y];
                    var destinationXCoordinate = feature.properties[originAndDestinationFieldIds.destinationGeometry.x];
                    var destinationYCoordinate = feature.properties[originAndDestinationFieldIds.destinationGeometry.y];

                    // origin and destination points for drawing curved lines
                    // ensure that canvas features will be drawn beyond +/-180 longitude
                    var originLatLng = this._wrapAroundLatLng(L.latLng([originYCoordinate, originXCoordinate]));
                    var destinationLatLng = this._wrapAroundLatLng(L.latLng([destinationYCoordinate, destinationXCoordinate]));

                    // convert geometry to screen coordinates for canvas drawing
                    var screenOriginPoint = this._map.latLngToContainerPoint(originLatLng);
                    var screenDestinationPoint = this._map.latLngToContainerPoint(destinationLatLng);

                    // get the canvas symbol properties,
                    // and draw a curved canvas line
                    var symbol;
                    if (animate) {
                        symbol = this._getSymbolProperties(feature, this.options.animatedCanvasBezierStyle);
                        this._animateCanvasLineSymbol(ctx, symbol, screenOriginPoint, screenDestinationPoint);
                    } else {
                        symbol = this._getSymbolProperties(feature, this.options.canvasBezierStyle);
                        ctx.beginPath();
                        this._applyAnimatedCanvasLineSymbol(ctx, symbol, screenOriginPoint, screenDestinationPoint);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }, this);

            if (animate) {
                ctx.stroke();
                ctx.closePath();
            }
        },

        _getSymbolProperties: function(feature, canvasSymbolConfig) {
            // get the canvas symbol properties
            var symbol;
            var filteredSymbols;
            if (canvasSymbolConfig.type === 'simple') {
                symbol = canvasSymbolConfig.symbol;
            } else if (canvasSymbolConfig.type === 'uniqueValue') {
                filteredSymbols = canvasSymbolConfig.uniqueValueInfos.filter(function(info) {
                    return info.value === feature.properties[canvasSymbolConfig.field];
                });
                symbol = filteredSymbols[0].symbol;
            } else if (canvasSymbolConfig.type === 'classBreaks') {
                filteredSymbols = canvasSymbolConfig.classBreakInfos.filter(function(info) {
                    return (
                        info.classMinValue <= feature.properties[canvasSymbolConfig.field] &&
                        info.classMaxValue >= feature.properties[canvasSymbolConfig.field]
                    );
                });
                if (filteredSymbols.length) {
                    symbol = filteredSymbols[0].symbol;
                } else {
                    symbol = canvasSymbolConfig.defaultSymbol;
                }
            }
            return symbol;
        },

        _applyAnimatedCanvasLineSymbol: function(ctx, symbolObject, screenOriginPoint, screenDestinationPoint) {
            ctx.lineCap = symbolObject.lineCap;
            ctx.lineWidth = symbolObject.lineWidth;
            ctx.strokeStyle = symbolObject.strokeStyle;
            ctx.shadowBlur = symbolObject.shadowBlur;
            ctx.shadowColor = symbolObject.shadowColor;
            ctx.moveTo(screenOriginPoint.x, screenOriginPoint.y);
            ctx.bezierCurveTo(screenOriginPoint.x, screenDestinationPoint.y, screenDestinationPoint.x, screenDestinationPoint.y, screenDestinationPoint.x, screenDestinationPoint.y);
        },

        _animateCanvasLineSymbol: function(ctx, symbolObject, screenOriginPoint, screenDestinationPoint) {
            ctx.lineCap = symbolObject.lineCap;
            ctx.lineWidth = symbolObject.lineWidth;
            ctx.strokeStyle = symbolObject.strokeStyle;
            ctx.shadowBlur = symbolObject.shadowBlur;
            ctx.shadowColor = symbolObject.shadowColor;
            ctx.setLineDash([symbolObject.lineDashOffsetSize, (this._animationPropertiesStatic.resetOffset - symbolObject.lineDashOffsetSize)]);
            ctx.lineDashOffset = -this._animationPropertiesStatic.offset; // this makes the dot appear to move when the entire top canvas is redrawn
            ctx.moveTo(screenOriginPoint.x, screenOriginPoint.y);
            ctx.bezierCurveTo(screenOriginPoint.x, screenDestinationPoint.y, screenDestinationPoint.x, screenDestinationPoint.y, screenDestinationPoint.x, screenDestinationPoint.y);
        },

        _animator: function(time) {
            this._animationCanvasElement.getContext('2d')
                .clearRect(0, 0, this._animationCanvasElement.width, this._animationCanvasElement.height);

            this._drawSelectedCanvasPaths(true); // draw it again to give the appearance of a moving dot with a new lineDashOffset

            TWEEN.update(time);

            this._animationFrameId = L.Util.requestAnimFrame(this._animator, this);
        },

        _wrapGeoJsonCircleMarkers: function() {
            // ensure that the GeoJson point features,
            // which are drawn on the map as individual CircleMarker layers,
            // will be drawn beyond +/-180 longitude
            this.eachLayer(function(layer) {
                var wrappedLatLng = this._wrapAroundLatLng(layer.getLatLng());
                layer.setLatLng(wrappedLatLng);
            }, this);
        },

        _wrapAroundLatLng: function(latLng) {
            if (this._map && this.options.wrapAroundCanvas) {
                var wrappedLatLng = latLng.clone();
                var mapCenterLng = this._map.getCenter().lng;
                var wrapAroundDiff = mapCenterLng - wrappedLatLng.lng;
                if (wrapAroundDiff < -180 || wrapAroundDiff > 180) {
                    wrappedLatLng.lng += (Math.round(wrapAroundDiff / 360) * 360);
                }
                return wrappedLatLng;
            } else {
                return latLng;
            }
        }
    });

    return CanvasFlowmapLayer;

}, window));
