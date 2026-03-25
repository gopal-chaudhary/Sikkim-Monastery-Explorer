import React from 'react';
import MonasteryImage from './MonasteryImage';

// Update Home.jsx to use the new MonasteryImage component
const FeaturedMonasteryCard = ({ monastery, index }) => {
  return (
    <div className="card group block" data-index={index}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <MonasteryImage
          monastery={monastery}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          optimizeWidth={800}
          alt={`${monastery.name} monastery`}
          onImageError={(monastery) => {
            console.warn(`Failed to load image for ${monastery.name}`);
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass backdrop-blur-md border-[var(--accent-border)]">
          <Star className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" /> 
          <span className="text-sm font-semibold text-[var(--text-primary)]">{monastery.rating ?? '—'}</span>
        </div>
        
        {/* Content Overlay on Hover */}
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h4 className="font-heading text-xl font-bold text-white mb-1">{monastery.name}</h4>
          <p className="text-white/90 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> 
            {monastery.region || (monastery.location?.district || monastery.location?.village || monastery.location)} · Est. {monastery.established || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-[var(--bg-card)] rounded-b-2xl border border-[var(--border-primary)] border-t-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-1">{monastery.name}</h4>
            <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> 
              {monastery.region || (monastery.location?.district || monastery.location?.village || monastery.location)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform duration-300">
            <span className="text-xs font-medium">View details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMonasteryCard;
