/* 
 * Copyright (c) 2015 by Rafael Angel Aznar Aparici (rafaaznar at gmail dot com)
 * 
 * openAUSIAS: The stunning micro-library that helps you to develop easily 
 *             AJAX web applications by using Java and jQuery
 * openAUSIAS is distributed under the MIT License (MIT)
 * Sources at https://github.com/rafaelaznar/
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */


'use strict';

moduloOpendata.controller('OpendataMapController', ['MarkerCreatorService', '$scope', '$routeParams', 'serverService', '$location', '$http',
    function (MarkerCreatorService, $scope, $routeParams, serverService, $location, $http) {
        $scope.title = "Vista Google Maps con Open Data";
        $scope.icon = "fa-fa-globe";
        $scope.ob = 'opendata';
        $scope.id = $routeParams.id;
        serverService.getDataFromPromise(serverService.promise_getOne($scope.ob, $scope.id)).then(function (data) {
            $scope.bean = data.message;
        });
        $scope.close = function () {
            $location.path('/home');
        };

        $scope.back = function () {
            window.history.back();
        };


        MarkerCreatorService.createByCoords(39.447829, -0.368581, function (marker) {
            marker.options.labelContent = 'CIPFP AUSIAS MARCH';
            $scope.cipfpMarker = marker;
        });

        $scope.address = '';

        $scope.map = {
            center: {
                latitude: $scope.cipfpMarker.latitude,
                longitude: $scope.cipfpMarker.longitude
            },
            zoom: 12,
            markers: [],
            control: {},
            options: {
                scrollwheel: false
            }
        };

        $scope.map.markers.push($scope.cipfpMarker);

        $scope.addMarker = function (latitude, longitude) {

            MarkerCreatorService.createByCoords(latitude, longitude, function (marker) {
                marker.options.labelContent = 'Añadido';
                $scope.map.markers.push(marker);
                refresh(marker);
            });
        };


        $scope.addCurrentLocation = function () {
            MarkerCreatorService.createByCurrentLocation(function (marker) {
                marker.options.labelContent = 'Te encuentras aqui';
                $scope.map.markers.push(marker);
                refresh(marker);
            });
        };

        $scope.addAddress = function () {
            var address = $scope.address;
            if (address !== '') {
                MarkerCreatorService.createByAddress(address, function (marker) {
                    $scope.map.markers.push(marker);
                    refresh(marker);
                });
            }
        };

        function refresh(marker) {
            $scope.map.control.refresh({latitude: marker.latitude,
                longitude: marker.longitude});
        }
        
        $scope.removeMarkers = function() {
                $scope.map.markers = [];
            }

        //URL JSON BICIS
        var url = "http://datosabiertos.malaga.eu/recursos/transporte/trafico/poi_apbicis.geojson";

        $http.get(url, 'GET', '').then(function (data) {
            $scope.data = data.data.features;


            $scope.addMarkerb = function () {

                for (var i = 0, l = data.data.features.length; i < l; i++) {
              
                    var latitude = $scope.data[i].geometry.coordinates[1];
                    var longitude = $scope.data[i].geometry.coordinates[0];
                    MarkerCreatorService.createByCoords(latitude, longitude, function (marker) {
                        marker.options.labelContent = 'AparcaBicis ' + i;
                        marker.options.icon = 'https://maps.google.com/mapfiles/ms/icons/cycling.png';
                        $scope.map.markers.push(marker);
                        refresh(marker);
                    });
                }

            };


        });


        //URL JSON Motos
        var urlb = "http://datosabiertos.malaga.eu/recursos/transporte/trafico/poi_apmotos.geojson";

        $http.get(urlb, 'GET', '').then(function (data) {
            $scope.moto = data.data.features;


            $scope.addMarkerc = function () {

                for (var i = 0, l = data.data.features.length; i < l; i++) {
                    var latitude = $scope.moto[i].geometry.coordinates[1];
                    var longitude = $scope.moto[i].geometry.coordinates[0];
                    MarkerCreatorService.createByCoords(latitude, longitude, function (marker) {
                        marker.options.labelContent = 'AparcaMotos ' + i;
                        marker.options.icon = 'https://maps.google.com/mapfiles/ms/icons/motorcycling.png';
                        $scope.map.markers.push(marker);
                        refresh(marker);
                    });
                }

            };


        });
        
                    //JSON Movilidad Reducida
        var urlb = "http://datosabiertos.malaga.eu/recursos/transporte/trafico/poi_pmr.geojson";

        $http.get(urlb, 'GET', '').then(function (data) {
            $scope.reducida = data.data.features;


            $scope.addMarkerd = function () {
                
                for (var i = 0,l = data.data.features.length; i < l; i++) {
                     var latitude = $scope.reducida[i].geometry.coordinates[1];
                var longitude = $scope.reducida[i].geometry.coordinates[0];
                MarkerCreatorService.createByCoords(latitude, longitude, function (marker) {
//                    marker.options.labelContent = 'Aparcamiento Minusválidos '+i;
                    marker.options.icon='https://maps.google.com/mapfiles/ms/icons/wheel_chair_accessible.png';
                    $scope.map.markers.push(marker);
                    refresh(marker);
                });
                }
               
            };
        
        
        });

    }]);