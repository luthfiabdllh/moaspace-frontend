import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AnnouncementCategoryBadge,
  AnnouncementTargetBadge,
} from '../components/announcement-badge';

describe('Announcement Badges', () => {
  describe('AnnouncementCategoryBadge', () => {
    it('renders Penting for URGENT category', () => {
      render(<AnnouncementCategoryBadge category="URGENT" />);
      expect(screen.getByText('Penting')).toBeDefined();
    });

    it('renders Rapat for MEETING category', () => {
      render(<AnnouncementCategoryBadge category="MEETING" />);
      expect(screen.getByText('Rapat')).toBeDefined();
    });

    it('renders Kegiatan for ACTIVITY category', () => {
      render(<AnnouncementCategoryBadge category="ACTIVITY" />);
      expect(screen.getByText('Kegiatan')).toBeDefined();
    });

    it('renders Informasi for INFO category', () => {
      render(<AnnouncementCategoryBadge category="INFO" />);
      expect(screen.getByText('Informasi')).toBeDefined();
    });
  });

  describe('AnnouncementTargetBadge', () => {
    it('renders Semua Tim for ALL target', () => {
      render(<AnnouncementTargetBadge targetType="ALL" />);
      expect(screen.getByText('Semua Tim')).toBeDefined();
    });

    it('renders Divisi name for DIVISION target', () => {
      render(
        <AnnouncementTargetBadge
          targetType="DIVISION"
          divisionName="Media & Kreatif"
        />
      );
      expect(screen.getByText('Divisi Media & Kreatif')).toBeDefined();
    });

    it('renders Posko name for SUBUNIT target', () => {
      render(
        <AnnouncementTargetBadge
          targetType="SUBUNIT"
          subunitName="Dusun Tirto"
        />
      );
      expect(screen.getByText('Posko Dusun Tirto')).toBeDefined();
    });

    it('renders Klaster name for CLUSTER target', () => {
      render(
        <AnnouncementTargetBadge
          targetType="CLUSTER"
          cluster="SAINTEK"
        />
      );
      expect(screen.getByText('Klaster SAINTEK')).toBeDefined();
    });
  });
});
