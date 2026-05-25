import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title?: string): void {
    this.toastr.success(message, title, this.config());
  }

  error(message: string, title?: string): void {
    this.toastr.error(message, title, this.config());
  }

  warning(message: string, title?: string): void {
    this.toastr.warning(message, title, this.config());
  }

  info(message: string, title?: string): void {
    this.toastr.info(message, title, this.config());
  }

  private config(): Partial<IndividualConfig> {
    return {
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
    };
  }
}
