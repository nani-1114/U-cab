import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Compass, Minus, Plus, MoonStar, ShieldAlert } from 'lucide-react';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getCarIcon = (rotationAngle = 0) =>
  new L.DivIcon({
    className: 'driver-car-icon',
    html: `<div style="transform: rotate(${rotationAngle}deg); background: linear-gradient(135deg, #111827, #4f46e5); border-radius: 999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(15, 23, 42, 0.25); border: 2px solid white;"><span style="font-size: 20px; color: white;">🚗</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const RoutingControl = ({ waypoints, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const cleanupRoutingControl = () => {
      const control = routingControlRef.current;
      if (!control) return;

      try {
        if (typeof control.remove === 'function') {
          control.remove();
        } else if (map && typeof map.removeControl === 'function') {
          map.removeControl(control);
        }
      } catch (error) {
        console.warn('Routing control cleanup warning:', error);
      } finally {
        routingControlRef.current = null;
      }
    };

    cleanupRoutingControl();

    if (waypoints && waypoints.length >= 2 && waypoints[0] && waypoints[1]) {
      const routingControl = L.Routing.control({
        waypoints: waypoints.map((wp) => L.latLng(wp.lat, wp.lng)),
        lineOptions: {
          styles: [{ color: 'rgba(59, 130, 246, 0.28)', opacity: 0.95, weight: 8 }],
        },
        createMarker: () => null,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
        }),
      });

      routingControl.on('routesfound', (event) => {
        const routes = event.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          const summary = route.summary;
          const coordinates = route.coordinates.map((point) => [point.lat, point.lng]);
          if (onRouteFound) {
            onRouteFound({
              distanceInKm: Number((summary.totalDistance / 1000).toFixed(1)),
              estimatedDurationInMin: Math.ceil(summary.totalTime / 60),
              coordinates,
            });
          }
        }
      });

      try {
        routingControl.addTo(map);
        routingControlRef.current = routingControl;
      } catch (error) {
        console.warn('Routing control attachment warning:', error);
      }
    }

    return () => {
      cleanupRoutingControl();
    };
  }, [map, waypoints, onRouteFound]);

  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(event) {
      if (onMapClick) onMapClick(event.latlng);
    },
  });
  return null;
};

const MapBoundsFitter = ({ boundsTargets }) => {
  const map = useMap();
  useEffect(() => {
    if (boundsTargets && boundsTargets.length >= 2) {
      const validTargets = boundsTargets.filter((target) => target && target.lat && target.lng);
      if (validTargets.length >= 2) {
        const bounds = L.latLngBounds(validTargets.map((target) => [target.lat, target.lng]));
        map.fitBounds(bounds, { paddingBottomRight: [40, 350], paddingTopLeft: [40, 80], animate: true });
      }
    }
  }, [boundsTargets, map]);
  return null;
};

const ViewController = ({ centerOverride, zoomOverride }) => {
  const map = useMap();
  useEffect(() => {
    if (centerOverride && centerOverride.lat && centerOverride.lng) {
      map.flyTo([centerOverride.lat, centerOverride.lng], zoomOverride || map.getZoom(), { duration: 1.1 });
    }
  }, [centerOverride, zoomOverride, map]);
  return null;
};

const RideMap = ({
  pickup,
  drop,
  driverLocation,
  routeWaypoints,
  boundsTargets,
  onRouteFound,
  onMapClick,
  fullScreen = false,
  darkMode = false,
  onRecenter,
  onZoomIn,
  onZoomOut,
  onToggleTheme,
  onEmergency,
  completedRoute = [],
  remainingRoute = [],
  rotationAngle = 0,
  centerOverride,
  zoomOverride,
}) => {
  const defaultCenter = [12.9716, 77.5946];
  const activeWaypoints = routeWaypoints || (pickup && drop ? [pickup, drop] : []);

  return (
    <div className={`overflow-hidden position-relative ${fullScreen ? 'w-100 h-100' : 'rounded-4 shadow-sm h-100'}`} style={{ minHeight: fullScreen ? '100vh' : '600px', zIndex: 0 }}>
      <MapContainer
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
        />

        <RoutingControl waypoints={activeWaypoints} onRouteFound={onRouteFound} />
        <ViewController centerOverride={centerOverride} zoomOverride={zoomOverride} />

        {completedRoute.length > 1 && <Polyline positions={completedRoute.map((point) => [point[0], point[1]])} pathOptions={{ color: '#2563eb', weight: 8, opacity: 0.95 }} />}
        {remainingRoute.length > 1 && <Polyline positions={remainingRoute.map((point) => [point[0], point[1]])} pathOptions={{ color: 'rgba(15, 23, 42, 0.2)', weight: 6, dashArray: '8 8', opacity: 0.8 }} />}

        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} zIndexOffset={500} />}
        {drop && <Marker position={[drop.lat, drop.lng]} icon={dropIcon} zIndexOffset={500} />}
        {driverLocation && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={getCarIcon(rotationAngle)} zIndexOffset={1000} />}

        <MapClickHandler onMapClick={onMapClick} />
        {boundsTargets && <MapBoundsFitter boundsTargets={boundsTargets} />}
      </MapContainer>

      <div className="position-absolute end-0 top-0 m-3 z-1 d-flex flex-column gap-2">
        <button type="button" onClick={onZoomIn} className="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
          <Plus size={18} />
        </button>
        <button type="button" onClick={onZoomOut} className="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
          <Minus size={18} />
        </button>
        <button type="button" onClick={onRecenter} className="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
          <Compass size={18} />
        </button>
        <button type="button" onClick={onToggleTheme} className="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
          <MoonStar size={18} />
        </button>
        <button type="button" onClick={onEmergency} className="btn btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
          <ShieldAlert size={18} />
        </button>
      </div>
    </div>
  );
};

export default RideMap;
