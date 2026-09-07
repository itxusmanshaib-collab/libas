import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config.service';

interface Value {
  icon: string;
  title: string;
  desc: string;
}

interface Milestone {
  year: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class About {
  config = inject(AppConfigService);

  values: Value[] = [
    {
      icon: 'M12 2 2 7l10 5 10-5-10-5Zm0 8L2 5v10l10 5 10-5V5l-10 5Z',
      title: 'Built to last',
      desc: 'Reliable denim, considered details and quality you can feel from the first wear.'
    },
    {
      icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z',
      title: 'Fit comes first',
      desc: 'Straight, slim and relaxed silhouettes designed to move naturally through your day.'
    },
    {
      icon: 'M12 21c-4.4-3.5-8-7-8-11a8 8 0 0 1 16 0c0 4-3.6 7.5-8 11Zm0-7.5A3.5 3.5 0 1 0 12 6.5a3.5 3.5 0 0 0 0 7Z',
      title: 'Made with intent',
      desc: 'We keep the design language clean so your style, not a logo, does the talking.'
    },
    {
      icon: 'M20 6 9 17l-5-5 1.4-1.4L9 14.2l9.6-9.6L20 6Z',
      title: 'Easy to wear',
      desc: 'Versatile pieces that work with the clothes you already own and the plans you make.'
    }
  ];

  milestones: Milestone[] = [
    { year: '2021', title: 'The beginning', desc: 'Libas Junior started with a simple idea: everyday denim should feel anything but ordinary.' },
    { year: '2022', title: 'First collection', desc: 'Our first fits launched with a focus on comfort, clean lines and confident washes.' },
    { year: '2024', title: 'Nationwide delivery', desc: 'We expanded across Pakistan, helping more customers find their everyday pair.' },
    { year: '2026', title: 'A new chapter', desc: 'Today, Libas Junior is building a modern denim wardrobe one considered piece at a time.' }
  ];
}