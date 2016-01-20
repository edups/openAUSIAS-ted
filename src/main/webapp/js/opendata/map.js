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

moduloOpendata.factory('MarkerCreatorService', function () {

    var markerId = 0;

    function create(latitude, longitude) {
        var marker = {
            options: {
                animation: 0,
                labelAnchor: "22 -5",
                labelClass: 'markerlabel'
            },
            latitude: latitude,
            longitude: longitude,
            id: ++markerId
        };
        return marker;
    }

    function invokeSuccessCallback(successCallback, marker) {
        if (typeof successCallback === 'function') {
            successCallback(marker);
        }
    }

    function createByCoords(latitude, longitude, successCallback) {
        var marker = create(latitude, longitude);
        invokeSuccessCallback(successCallback, marker);
    }

    function createByAddress(address, successCallback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var firstAddress = results[0];
                var latitude = firstAddress.geometry.location.lat();
                var longitude = firstAddress.geometry.location.lng();
                var marker = create(latitude, longitude);
                invokeSuccessCallback(successCallback, marker);
            } else {
                alert("Dirección desconocida: " + address);
            }
        });
    }

    function createByCurrentLocation(successCallback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var marker = create(position.coords.latitude, position.coords.longitude);
                invokeSuccessCallback(successCallback, marker);
            });
        } else {
            alert('No se encuentra la posición actual');
        }
    }

    return {
        createByCoords: createByCoords,
        createByAddress: createByAddress,
        createByCurrentLocation: createByCurrentLocation
    };

});

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


        MarkerCreatorService.createByCoords(39.2329533, -0.5241572, function (marker) {
            marker.options.labelContent = 'Este es mi pueblo';
            $scope.carletMarker = marker;
        });

        $scope.address = '';

        $scope.map = {
            center: {
                latitude: $scope.carletMarker.latitude,
                longitude: $scope.carletMarker.longitude
            },
            zoom: 12,
            markers: [],
            control: {},
            options: {
                scrollwheel: false
            }
        };

        $scope.map.markers.push($scope.carletMarker);

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

    }]);