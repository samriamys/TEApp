import { Directive, ElementRef, HostListener, Input, OnChanges, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Falls back when a URL is absent or an image fails to load. */
@Directive({ selector: 'img[appWordImage]', standalone: true })
export class WordImageDirective implements OnChanges {
  @Input() appWordImage: string | null | undefined;
  @Input() imageDescription = 'Imagen de la palabra';
  private readonly placeholder = 'assets/icon/word-placeholder.svg';
  private showingPlaceholder = false;

  constructor(private element: ElementRef<HTMLImageElement>, private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    const requested = this.appWordImage?.trim();
    const sanitized = requested ? this.sanitizer.sanitize(SecurityContext.URL, requested) : null;
    const source = sanitized && !sanitized.startsWith('unsafe:') ? sanitized : null;
    this.showingPlaceholder = !source;
    this.element.nativeElement.alt = source ? this.imageDescription : 'Imagen no disponible';
    this.element.nativeElement.src = source || this.placeholder;
  }

  @HostListener('error') onError(): void {
    if (this.showingPlaceholder) return;
    this.showingPlaceholder = true;
    this.element.nativeElement.alt = 'Imagen no disponible';
    this.element.nativeElement.src = this.placeholder;
  }
}
