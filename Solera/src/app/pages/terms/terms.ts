import { Component, OnInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.html',
  styleUrls: ['./terms.scss']
})
export class Terms implements OnInit {
  private el = inject(ElementRef);
  settings = inject(SettingsService);

  currentYear = new Date().getFullYear();

  // Terms agreement index sections
  sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'accounts', title: '2. User Accounts & Security' },
    { id: 'intellectual', title: '3. Intellectual Property' },
    { id: 'purchases', title: '4. Products, Orders & Payments' },
    { id: 'limitation', title: '5. Limitation of Liability' },
    { id: 'governing', title: '6. Governing Law' }
  ];

  ngOnInit(): void {
    this.initEntranceAnimation();
  }

  // Handles fast sidebar smooth positioning
  scrollToSection(sectionId: string): void {
    const target = this.el.nativeElement.querySelector(`#${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private initEntranceAnimation(): void {
    const root = this.el.nativeElement;
    
    // Elegant slide up and fade cascade matching your premium application themes
    gsap.from(root.querySelectorAll('.animate-terms'), {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }
}