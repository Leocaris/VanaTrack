import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  ExternalLink,
  Sprout,
  Target,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProgressBar } from '../../components/common/ProgressBar';

// Custom SVG map marker pin for Leaflet
const createCustomMarker = (category, completion) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: #0f2e22;
        border: 2px solid #52b788;
        color: #ffffff;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transform: translate(-17px, -17px);
        font-family: sans-serif;
        font-weight: bold;
        font-size: 11px;
      ">
        🌲
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
};

export const ProjectMap = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.get('/projects');
        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects =
    categoryFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === categoryFilter);

  // Default center: India (20.5937, 78.9629)
  const defaultCenter = [18.5204, 78.8567];

  if (loading) {
    return <LoadingSpinner text="Rendering geospatial project coordinates..." size="lg" />;
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Map Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Geospatial Project Mapping
            </h2>
            <p className="text-[11px] text-slate-500">
              Interactive OpenStreetMap GIS visualization of verified restoration biomes
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Biome Filter:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-forest-700"
          >
            <option value="All">All Biomes ({projects.length})</option>
            <option value="Agroforestry">Agroforestry</option>
            <option value="Mangrove Restoration">Mangrove Restoration</option>
            <option value="Urban Greenery">Urban Greenery</option>
            <option value="Afforestation">Afforestation</option>
            <option value="Biodiversity Corridor">Biodiversity Corridor</option>
          </select>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden relative">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredProjects.map((project) => {
            const stats = project.stats || {};
            const verified = stats.verifiedTrees || 0;
            const target = project.targetTrees || 1;
            const remaining = stats.remainingTarget ?? Math.max(0, target - verified);
            const completion = stats.completionPercentage ?? Math.round((verified / target) * 100);

            return (
              <Marker
                key={project._id}
                position={[project.latitude, project.longitude]}
                icon={createCustomMarker(project.category, completion)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 max-w-[260px] text-xs font-sans space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded text-[10px] border border-forest-100">
                        {project.projectId}
                      </span>
                      <Badge variant={project.status} size="xs">
                        {project.status}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {project.name}
                    </h4>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <ProgressBar
                        value={verified}
                        max={target}
                        size="sm"
                        sublabel={`${verified.toLocaleString()} / ${target.toLocaleString()} trees`}
                      />

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                        <span>Remaining: {remaining.toLocaleString()}</span>
                        <span className="text-emerald-700 font-bold">
                          Survival: {stats.survivalRate !== null ? `${stats.survivalRate}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-forest-900 hover:bg-forest-950 text-white font-semibold text-[11px] transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Open Project Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
