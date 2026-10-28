import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  DoorClosed,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import FlagBadge from '../components/FlagBadge';
import { useLanguage } from '../context/LanguageContext';

import { getCached, setCached } from '../utils/apiCache';

export default function LocationsPage() {
  const { language, t } = useLanguage();

  const [locations, setLocations] = useState(() => getCached('locations') || { buildings: [], floors: [], rooms: [] });
  const [loading, setLoading] = useState(() => !getCached('locations'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Modals state
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorForm, setFloorForm] = useState({
    building_id: 1,
    floor_number: 0,
    name_fr: '',
    name_en: ''
  });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    floor_id: 1,
    room_number: '',
    name_fr: '',
    name_en: '',
    capacity: 30,
    type: 'MEETING'
  });

  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [capacityTargetRoom, setCapacityTargetRoom] = useState(null);
  const [capacityValue, setCapacityValue] = useState(30);

  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [buildingForm, setBuildingForm] = useState({
    code: '',
    name_fr: '',
    name_en: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLocations = (silent = false) => {
    if (!silent && !getCached('locations')) setLoading(true);
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'success' && d.data) {
          setLocations(d.data);
          setCached('locations', d.data);
        }
      })
      .catch((err) => console.error('Failed to fetch locations', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocations(true);
  }, []);

  // Calculate Metrics
  const totalBuildings = locations.buildings?.length || 0;
  const totalFloors = locations.floors?.length || 0;
  const totalRooms = locations.rooms?.length || 0;
  const totalCapacity = locations.rooms?.reduce((acc, r) => acc + (parseInt(r.capacity, 10) || 0), 0) || 0;

  // ==========================================
  // FLOOR CRUD HANDLERS
  // ==========================================
  const openFloorModal = (floor = null, defaultBuildingId = null) => {
    if (floor) {
      setEditingFloor(floor);
      setFloorForm({
        building_id: floor.building_id,
        floor_number: floor.floor_number,
        name_fr: floor.name_fr || '',
        name_en: floor.name_en || ''
      });
    } else {
      setEditingFloor(null);
      setFloorForm({
        building_id: defaultBuildingId || locations.buildings?.[0]?.id || 1,
        floor_number: 0,
        name_fr: '',
        name_en: ''
      });
    }
    setIsFloorModalOpen(true);
  };

  const handleFloorSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFloor
        ? `/api/locations/floors/${editingFloor.id}`
        : '/api/locations/floors';
      const method = editingFloor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(floorForm)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(
          editingFloor
            ? (language === 'FR' ? 'Étage mis à jour avec succès' : 'Floor updated successfully')
            : (language === 'FR' ? 'Nouvel étage créé avec succès' : 'New floor created successfully')
        );
        setIsFloorModalOpen(false);
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFloor = async (floorId) => {
    const confirmMsg = language === 'FR'
      ? 'Êtes-vous sûr de vouloir supprimer cet étage et toutes ses salles rattachées ?'
      : 'Are you sure you want to delete this floor and all its rooms?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/locations/floors/${floorId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(language === 'FR' ? 'Étage supprimé' : 'Floor deleted');
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==========================================
  // ROOM CRUD HANDLERS
  // ==========================================
  const openRoomModal = (room = null, defaultFloorId = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        floor_id: room.floor_id,
        room_number: room.room_number || '',
        name_fr: room.name_fr || '',
        name_en: room.name_en || '',
        capacity: room.capacity || 0,
        type: room.type || 'MEETING'
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        floor_id: defaultFloorId || locations.floors?.[0]?.id || 1,
        room_number: '',
        name_fr: '',
        name_en: '',
        capacity: 30,
        type: 'MEETING'
      });
    }
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRoom
        ? `/api/locations/rooms/${editingRoom.id}`
        : '/api/locations/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomForm)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(
          editingRoom
            ? (language === 'FR' ? 'Salle / Espace mis à jour' : 'Room / Space updated')
            : (language === 'FR' ? 'Nouvelle salle créée' : 'New room created')
        );
        setIsRoomModalOpen(false);
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmMsg = language === 'FR'
      ? 'Supprimer définitivement cet espace ?'
      : 'Permanently delete this space?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/locations/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(language === 'FR' ? 'Salle supprimée' : 'Room deleted');
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==========================================
  // DIRECT CAPACITY MODIFIER HANDLER
  // ==========================================
  const openCapacityModal = (room) => {
    setCapacityTargetRoom(room);
    setCapacityValue(room.capacity || 0);
    setIsCapacityModalOpen(true);
  };

  const handleCapacitySubmit = async (e) => {
    e.preventDefault();
    if (!capacityTargetRoom) return;

    try {
      const res = await fetch(`/api/locations/rooms/${capacityTargetRoom.id}/capacity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: parseInt(capacityValue, 10) })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(
          language === 'FR'
            ? `Capacité de « ${capacityTargetRoom.room_number} » mise à jour : ${capacityValue} places`
            : `Capacity for "${capacityTargetRoom.room_number}" updated: ${capacityValue} seats`
        );
        setIsCapacityModalOpen(false);
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==========================================
  // BUILDING CRUD HANDLERS
  // ==========================================
  const openBuildingModal = (building = null) => {
    if (building) {
      setEditingBuilding(building);
      setBuildingForm({
        code: building.code || '',
        name_fr: building.name_fr || '',
        name_en: building.name_en || ''
      });
    } else {
      setEditingBuilding(null);
      setBuildingForm({
        code: '',
        name_fr: '',
        name_en: ''
      });
    }
    setIsBuildingModalOpen(true);
  };

  const handleBuildingSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBuilding
        ? `/api/locations/buildings/${editingBuilding.id}`
        : '/api/locations/buildings';
      const method = editingBuilding ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildingForm)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(
          editingBuilding
            ? (language === 'FR' ? 'Bâtiment mis à jour' : 'Building updated')
            : (language === 'FR' ? 'Nouveau bâtiment créé' : 'New building created')
        );
        setIsBuildingModalOpen(false);
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    const confirmMsg = language === 'FR'
      ? 'Supprimer ce bâtiment ainsi que ses étages et salles associés ?'
      : 'Delete this building along with all its floors and rooms?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/locations/buildings/${buildingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(language === 'FR' ? 'Bâtiment supprimé' : 'Building deleted');
        fetchLocations();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Helper for room type badge style
  const getRoomTypeInfo = (type) => {
    switch (type) {
      case 'CONFERENCE':
        return {
          label: t('roomTypeConference'),
          bg: 'rgba(38, 96, 164, 0.12)',
          color: '#1D4E89',
          border: '1px solid rgba(38, 96, 164, 0.25)'
        };
      case 'AUDITORIUM':
        return {
          label: t('roomTypeAuditorium'),
          bg: 'rgba(212, 175, 55, 0.15)',
          color: '#997300',
          border: '1px solid rgba(212, 175, 55, 0.35)'
        };
      case 'HALL':
        return {
          label: t('roomTypeHall'),
          bg: 'rgba(16, 185, 129, 0.12)',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        };
      case 'OFFICE':
        return {
          label: t('roomTypeOffice'),
          bg: 'rgba(100, 116, 139, 0.12)',
          color: '#475569',
          border: '1px solid rgba(100, 116, 139, 0.25)'
        };
      default:
        return {
          label: t('roomTypeMeeting'),
          bg: 'rgba(99, 102, 241, 0.12)',
          color: '#4F46E5',
          border: '1px solid rgba(99, 102, 241, 0.25)'
        };
    }
  };

  // Filter buildings
  const displayedBuildings = locations.buildings.filter((b) => {
    if (selectedBuildingId !== 'ALL' && b.id !== parseInt(selectedBuildingId, 10)) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Building2 size={26} style={{ color: '#134074' }} />
            <span>{t('locationsTitle')}</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {t('locationsSubtitle')}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          <button
            onClick={() => openBuildingModal()}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#1E293B',
              border: '1px solid #CBD5E1',
              padding: '9px 15px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={15} style={{ color: '#134074' }} />
            <span>{t('btnAddBuilding')}</span>
          </button>

          <button
            onClick={() => openFloorModal()}
            style={{
              backgroundColor: '#0B2545',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 15px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 6px rgba(11, 37, 69, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={15} />
            <span>{t('btnAddFloor')}</span>
          </button>

          <button
            onClick={() => openRoomModal()}
            style={{
              backgroundColor: '#134074',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 10px rgba(19, 64, 116, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>{t('btnAddRoom')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Buildings Metric */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#E6F0FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#134074'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalBuildings}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              {t('totalBuildingsMetric')}
            </div>
          </div>
        </div>

        {/* Floors Metric */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(38, 96, 164, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2660A4'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalFloors}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              {t('totalFloorsMetric')}
            </div>
          </div>
        </div>

        {/* Rooms Metric */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B8860B'
          }}>
            <DoorClosed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalRooms}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              {t('totalRoomsMetric')}
            </div>
          </div>
        </div>

        {/* Total Capacity Metric */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalCapacity} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>places</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              {t('totalCapacityMetric')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        border: '1px solid #E2E8F0',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLocationsPlaceholder')}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Building Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
            {language === 'FR' ? 'Filtrer Bâtiment :' : 'Filter Building:'}
          </span>
          <button
            onClick={() => setSelectedBuildingId('ALL')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.775rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedBuildingId === 'ALL' ? '#134074' : '#E2E8F0',
              backgroundColor: selectedBuildingId === 'ALL' ? '#134074' : '#FFFFFF',
              color: selectedBuildingId === 'ALL' ? '#FFFFFF' : '#475569',
              cursor: 'pointer'
            }}
          >
            {t('filterAll')}
          </button>
          {locations.buildings?.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBuildingId(b.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.775rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedBuildingId === b.id ? '#134074' : '#E2E8F0',
                backgroundColor: selectedBuildingId === b.id ? '#134074' : '#FFFFFF',
                color: selectedBuildingId === b.id ? '#FFFFFF' : '#475569',
                cursor: 'pointer'
              }}
            >
              {language === 'FR' ? b.name_fr : b.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Buildings & Editable Floors Hierarchy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {displayedBuildings.map((bldg) => {
          const bldgFloors = locations.floors?.filter((f) => f.building_id === bldg.id) || [];
          // Sort floors from highest to ground (0) to basement (-1)
          const sortedFloors = [...bldgFloors].sort((a, b) => b.floor_number - a.floor_number);

          return (
            <div
              key={bldg.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                overflow: 'hidden'
              }}
            >
              {/* Building Master Header */}
              <div style={{
                backgroundColor: '#0B2545',
                color: '#FFFFFF',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37'
                  }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', padding: '2px 8px', borderRadius: '4px' }}>
                        {bldg.code}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {language === 'FR' ? bldg.name_fr : bldg.name_en}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                      {language === 'FR' ? bldg.name_en : bldg.name_fr}
                    </p>
                  </div>
                </div>

                {/* Building Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => openFloorModal(null, bldg.id)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Plus size={14} />
                    <span>{t('btnAddFloor')}</span>
                  </button>

                  <button
                    onClick={() => openBuildingModal(bldg)}
                    title="Modifier Bâtiment"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#CBD5E1',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteBuilding(bldg.id)}
                    title="Supprimer Bâtiment"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F87171',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Floors Container */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sortedFloors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontStyle: 'italic' }}>
                    {language === 'FR' ? 'Aucun étage configuré dans ce bâtiment.' : 'No floors configured in this building.'}
                  </div>
                ) : (
                  sortedFloors.map((floor) => {
                    const floorRooms = locations.rooms?.filter((r) => r.floor_id === floor.id) || [];
                    const filteredRooms = floorRooms.filter((r) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        r.room_number?.toLowerCase().includes(q) ||
                        r.name_fr?.toLowerCase().includes(q) ||
                        r.name_en?.toLowerCase().includes(q) ||
                        floor.name_fr?.toLowerCase().includes(q) ||
                        floor.name_en?.toLowerCase().includes(q)
                      );
                    });

                    const floorCapacity = floorRooms.reduce((sum, r) => sum + (parseInt(r.capacity, 10) || 0), 0);

                    // Floor level badge color
                    const isGround = floor.floor_number === 0;
                    const isBasement = floor.floor_number < 0;

                    return (
                      <div
                        key={floor.id}
                        style={{
                          borderRadius: '12px',
                          border: isGround ? '2px solid #2660A4' : '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          overflow: 'hidden',
                          boxShadow: isGround ? '0 4px 10px rgba(38, 96, 164, 0.08)' : 'none'
                        }}
                      >
                        {/* Floor Editable Banner */}
                        <div style={{
                          backgroundColor: isGround ? '#EFF6FF' : '#FFFFFF',
                          padding: '0.9rem 1.25rem',
                          borderBottom: '1px solid #E2E8F0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                backgroundColor: isGround ? '#134074' : isBasement ? '#475569' : '#3E82C6',
                                color: '#FFFFFF',
                                letterSpacing: '0.04em'
                              }}
                            >
                              {isGround
                                ? (language === 'FR' ? 'RDC • Niveau 0' : 'Ground • Level 0')
                                : isBasement
                                ? (language === 'FR' ? `Sous-sol • Niveau ${floor.floor_number}` : `Basement • Level ${floor.floor_number}`)
                                : (language === 'FR' ? `Étage • Niveau ${floor.floor_number}` : `Floor • Level ${floor.floor_number}`)}
                            </span>

                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{language === 'FR' ? floor.name_fr : floor.name_en}</span>
                              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 400 }}>
                                ({language === 'FR' ? floor.name_en : floor.name_fr})
                              </span>
                            </h4>

                            <span style={{ fontSize: '0.775rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '12px' }}>
                              {floorRooms.length} {language === 'FR' ? 'espaces' : 'spaces'} • {floorCapacity} places
                            </span>
                          </div>

                          {/* Floor Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => openRoomModal(null, floor.id)}
                              style={{
                                backgroundColor: '#134074',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Plus size={13} />
                              <span>{language === 'FR' ? '+ Salle / Hall' : '+ Room / Hall'}</span>
                            </button>

                            {/* Edit Floor / Ground Level Button */}
                            <button
                              onClick={() => openFloorModal(floor, bldg.id)}
                              title={language === 'FR' ? 'Modifier cet étage / niveau' : 'Edit this floor / level'}
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                color: '#134074',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Edit2 size={13} />
                              <span>{language === 'FR' ? 'Modifier Niveau' : 'Edit Level'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteFloor(floor.id)}
                              title={language === 'FR' ? 'Supprimer cet étage' : 'Delete this floor'}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#DC2626',
                                padding: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Rooms List / Grid on this Floor */}
                        <div style={{ padding: '1rem' }}>
                          {filteredRooms.length === 0 ? (
                            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                              {language === 'FR' ? 'Aucune salle configurée sur ce niveau.' : 'No rooms configured on this level.'}
                            </div>
                          ) : (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                              gap: '0.85rem'
                            }}>
                              {filteredRooms.map((rm) => {
                                const typeInfo = getRoomTypeInfo(rm.type);

                                return (
                                  <div
                                    key={rm.id}
                                    style={{
                                      backgroundColor: '#FFFFFF',
                                      borderRadius: '10px',
                                      border: '1px solid #E2E8F0',
                                      padding: '0.85rem 1rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      gap: '0.75rem',
                                      transition: 'box-shadow 0.15s ease',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                    }}
                                  >
                                    <div>
                                      {/* Room Code & Type Badge */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <span style={{
                                          fontWeight: 800,
                                          fontSize: '0.85rem',
                                          color: '#0F172A',
                                          backgroundColor: '#F1F5F9',
                                          padding: '2px 8px',
                                          borderRadius: '6px'
                                        }}>
                                          {rm.room_number}
                                        </span>

                                        <span style={{
                                          fontSize: '0.725rem',
                                          fontWeight: 600,
                                          padding: '2px 8px',
                                          borderRadius: '20px',
                                          backgroundColor: typeInfo.bg,
                                          color: typeInfo.color,
                                          border: typeInfo.border
                                        }}>
                                          {typeInfo.label}
                                        </span>
                                      </div>

                                      {/* Room Titles */}
                                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                                        {language === 'FR' ? rm.name_fr : rm.name_en}
                                      </h5>
                                      <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.2 }}>
                                        {language === 'FR' ? rm.name_en : rm.name_fr}
                                      </p>
                                    </div>

                                    {/* Capacity Widget & Quick Actions */}
                                    <div style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      paddingTop: '0.5rem',
                                      borderTop: '1px dashed #E2E8F0'
                                    }}>
                                      {/* Interactive Capacity Pill (One click modifies capacity) */}
                                      <button
                                        onClick={() => openCapacityModal(rm)}
                                        title={language === 'FR' ? 'Cliquer pour modifier la capacité' : 'Click to adjust capacity'}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.35rem',
                                          padding: '4px 10px',
                                          borderRadius: '20px',
                                          border: '1px solid #CBD5E1',
                                          backgroundColor: '#F8FAFC',
                                          color: '#0F172A',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        <Users size={14} style={{ color: '#059669' }} />
                                        <span>{rm.capacity || 0} {language === 'FR' ? 'places' : 'seats'}</span>
                                        <Sliders size={12} style={{ color: '#64748B', marginLeft: '2px' }} />
                                      </button>

                                      {/* Edit & Delete Action Buttons */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <button
                                          onClick={() => openRoomModal(rm)}
                                          title={language === 'FR' ? 'Modifier tous les détails' : 'Edit room details'}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#134074',
                                            cursor: 'pointer',
                                            padding: '4px'
                                          }}
                                        >
                                          <Edit2 size={15} />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteRoom(rm.id)}
                                          title={language === 'FR' ? 'Supprimer cet espace' : 'Delete room'}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#DC2626',
                                            cursor: 'pointer',
                                            padding: '4px'
                                          }}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 1. FLOOR / LEVEL MODAL (EDIT & CREATE GROUND LEVELS)          */}
      {/* ============================================================ */}
      {isFloorModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(7, 13, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="msd-modal-box" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '540px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} style={{ color: '#134074' }} />
                <span>{editingFloor ? t('editFloorTitle') : t('createFloorTitle')}</span>
              </h3>
              <button onClick={() => setIsFloorModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleFloorSubmit}>
              {/* Building Selection */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  {t('building')} *
                </label>
                <select
                  value={floorForm.building_id}
                  onChange={(e) => setFloorForm({ ...floorForm, building_id: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  {locations.buildings?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} — {language === 'FR' ? b.name_fr : b.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor Number / Ground Level Index */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  {t('floorNumberLabel')} *
                </label>
                <input
                  type="number"
                  value={floorForm.floor_number}
                  onChange={(e) => setFloorForm({ ...floorForm, floor_number: parseInt(e.target.value, 10) })}
                  required
                  placeholder="0 pour RDC, 1 pour 1er, -1 pour sous-sol..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
                <p style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.2rem' }}>
                  {floorForm.floor_number === 0
                    ? (language === 'FR' ? 'Ce niveau sera identifié comme le Rez-de-Chaussée (Accueil Visiteurs).' : 'This level represents the Ground Floor (Main Entrance).')
                    : floorForm.floor_number < 0
                    ? (language === 'FR' ? 'Ce niveau correspond à un sous-sol ou niveau inférieur.' : 'This level corresponds to a basement or lower level.')
                    : (language === 'FR' ? `Étage supérieur (Niveau ${floorForm.floor_number}).` : `Upper floor (Level ${floorForm.floor_number}).`)}
                </p>
              </div>

              {/* French Name */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <FlagBadge lang="FR" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {language === 'FR' ? "Nom de l'étage (Français)" : 'Floor Name (French)'} *
                  </label>
                </div>
                <input
                  type="text"
                  value={floorForm.name_fr}
                  onChange={(e) => setFloorForm({ ...floorForm, name_fr: e.target.value })}
                  placeholder="Ex: Rez-de-Chaussée ou 2e Étage"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              {/* English Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {language === 'FR' ? "Nom de l'étage (Anglais)" : 'Floor Name (English)'} *
                  </label>
                </div>
                <input
                  type="text"
                  value={floorForm.name_en}
                  onChange={(e) => setFloorForm({ ...floorForm, name_en: e.target.value })}
                  placeholder="Ex: Ground Floor or 2nd Floor"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFloorModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#134074',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(19, 64, 116, 0.25)'
                  }}
                >
                  {editingFloor ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ROOM & CONFERENCE HALL FULL MODAL                          */}
      {/* ============================================================ */}
      {isRoomModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(7, 13, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="msd-modal-box" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '620px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DoorClosed size={20} style={{ color: '#134074' }} />
                <span>{editingRoom ? t('editRoomTitle') : t('createRoomTitle')}</span>
              </h3>
              <button onClick={() => setIsRoomModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                {/* Floor Assignment */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                    {t('floor')} *
                  </label>
                  <select
                    value={roomForm.floor_id}
                    onChange={(e) => setRoomForm({ ...roomForm, floor_id: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    {locations.floors?.map((f) => (
                      <option key={f.id} value={f.id}>
                        {language === 'FR' ? f.name_fr : f.name_en} (Niveau {f.floor_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Number / Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                    {language === 'FR' ? 'Code / Numéro de salle *' : 'Room Code / Number *'}
                  </label>
                  <input
                    type="text"
                    value={roomForm.room_number}
                    onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    required
                    placeholder="Ex: CONF-B, RDC-01, AUDIT-A"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Room Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                    {t('roomTypeLabel')}
                  </label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    <option value="CONFERENCE">{t('roomTypeConference')}</option>
                    <option value="AUDITORIUM">{t('roomTypeAuditorium')}</option>
                    <option value="MEETING">{t('roomTypeMeeting')}</option>
                    <option value="HALL">{t('roomTypeHall')}</option>
                    <option value="OFFICE">{t('roomTypeOffice')}</option>
                  </select>
                </div>

                {/* Capacity (People) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                    {t('roomCapacityLabel')} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value, 10) || 0 })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* French Name */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <FlagBadge lang="FR" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {language === 'FR' ? "Nom de l'espace (Français)" : 'Space Name (French)'} *
                  </label>
                </div>
                <input
                  type="text"
                  value={roomForm.name_fr}
                  onChange={(e) => setRoomForm({ ...roomForm, name_fr: e.target.value })}
                  placeholder="Ex: Grand Amphithéâtre des Télécommunications"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              {/* English Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {language === 'FR' ? "Nom de l'espace (Anglais)" : 'Space Name (English)'} *
                  </label>
                </div>
                <input
                  type="text"
                  value={roomForm.name_en}
                  onChange={(e) => setRoomForm({ ...roomForm, name_en: e.target.value })}
                  placeholder="Ex: Main Telecom Auditorium"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#134074',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(19, 64, 116, 0.25)'
                  }}
                >
                  {editingRoom ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. QUICK CAPACITY ADJUSTER MODAL                             */}
      {/* ============================================================ */}
      {isCapacityModalOpen && capacityTargetRoom && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(7, 13, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="msd-modal-box" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Users size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              {t('quickCapacityTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
              <strong>{capacityTargetRoom.room_number}</strong> — {language === 'FR' ? capacityTargetRoom.name_fr : capacityTargetRoom.name_en}
            </p>

            <form onSubmit={handleCapacitySubmit}>
              {/* Big Capacity Input */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setCapacityValue(Math.max(0, parseInt(capacityValue, 10) - 10))}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -10
                </button>

                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={capacityValue}
                  onChange={(e) => setCapacityValue(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '130px',
                    height: '54px',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: '2px solid #134074',
                    color: '#0F172A'
                  }}
                />

                <button
                  type="button"
                  onClick={() => setCapacityValue(parseInt(capacityValue, 10) + 10)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +10
                </button>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[25, 50, 80, 120, 200, 300].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCapacityValue(preset)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: capacityValue === preset ? '1px solid #134074' : '1px solid #E2E8F0',
                      backgroundColor: capacityValue === preset ? '#134074' : '#F1F5F9',
                      color: capacityValue === preset ? '#FFFFFF' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCapacityModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {language === 'FR' ? 'Appliquer la Capacité' : 'Apply Capacity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. BUILDING MODAL                                             */}
      {/* ============================================================ */}
      {isBuildingModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(7, 13, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="msd-modal-box" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} style={{ color: '#134074' }} />
                <span>{editingBuilding ? (language === 'FR' ? 'Modifier le Bâtiment' : 'Edit Building') : t('btnAddBuilding')}</span>
              </h3>
              <button onClick={() => setIsBuildingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleBuildingSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  {language === 'FR' ? 'Code Bâtiment' : 'Building Code'} *
                </label>
                <input
                  type="text"
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                  placeholder="Ex: MAIN_BLDG ou ANNEX_C"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <FlagBadge lang="FR" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {language === 'FR' ? 'Nom du Bâtiment (Français)' : 'Building Name (French)'} *
                  </label>
                </div>
                <input
                  type="text"
                  value={buildingForm.name_fr}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name_fr: e.target.value })}
                  placeholder="Ex: Bâtiment Principal MINPOSTEL"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {language === 'FR' ? 'Nom du Bâtiment (Anglais)' : 'Building Name (English)'} *
                  </label>
                </div>
                <input
                  type="text"
                  value={buildingForm.name_en}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name_en: e.target.value })}
                  placeholder="Ex: MINPOSTEL Main Building"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBuildingModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#134074',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(19, 64, 116, 0.25)'
                  }}
                >
                  {editingBuilding ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
