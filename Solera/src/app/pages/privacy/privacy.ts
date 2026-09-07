import { Component, OnInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.html',
  styleUrls: ['./privacy.scss']
})
export class Privacy implements OnInit {
  private el = inject(ElementRef);
  settings = inject(SettingsService);

  currentYear = new Date().getFullYear();

  // Navigation outline sidebar indices
  sections = [
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'usage', title: '2. How We Use Your Data' },
    { id: 'sharing', title: '3. Data Sharing & Third Parties' },
    { id: 'security', title: '4. Security and Storage' },
    { id: 'rights', title: '5. Your Rights & Choices' },
    { id: 'updates', title: '6. Updates to This Policy' }
  ];

  ngOnInit(): void {
    this.initEntranceAnimation();
  }

  // Smooth scroll handler for side-panel elements
  scrollToSection(sectionId: string): void {
    const target = this.el.nativeElement.querySelector(`#${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private initEntranceAnimation(): void {
    const root = this.el.nativeElement;
    
    // Smooth high-end layout animation stagger
    gsap.from(root.querySelectorAll('.animate-privacy'), {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }
}