import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';

interface AnnouncementData {
  enabled: boolean;
  text: string;
  link?: string;
}

interface AnnouncementBarProps {
  initialData?: AnnouncementData;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ initialData }) => {
  const [data, setData] = useState<AnnouncementData>(
    initialData || {
      enabled: true,
      text: 'ارسال رایگان به سراسر کشور برای خریدهای بالای ۱،۵۰۰،۰۰۰ تومان | کالکشن جدید سام‌استایل فعال شد',
      link: '#shop',
    }
  );
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Fetch live announcement from backend
    fetch('/api/announcement')
      .then((res) => res.json())
      .then((json) => {
        if (json?.status === 'success' && json?.announcement) {
          setData(json.announcement);
        }
      })
      .catch((err) => console.log('Error fetching announcement:', err));
  }, []);

  if (!data.enabled || isDismissed || !data.text) {
    return null;
  }

  return (
    <aside
      aria-label="اعلان ویژه فروشگاه"
      className="bg-[#181818] text-[#F2F0EB] border-b border-[var(--border-subtle)] py-1 px-3 text-[11px] tracking-wide transition-all z-50 relative"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden mx-auto">
          <span className="flex items-center justify-center w-4 h-4 rounded-xs bg-[var(--accent)] text-[#111111] shrink-0 font-bold">
            <Megaphone size={10} />
          </span>
          <p className="truncate text-center font-medium text-[11px] sm:text-xs text-[#e0dfd9]">
            {data.text}
          </p>
          {data.link && (
            <a
              href={data.link}
              className="hidden sm:inline-block text-[var(--accent)] hover:underline font-bold mr-2 shrink-0 text-[11px]"
            >
              مشاهده محصولات ←
            </a>
          )}
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shrink-0 cursor-pointer"
          aria-label="بستن اعلان"
          title="بستن"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
};
