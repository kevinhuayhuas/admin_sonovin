import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-content">
      <div class="dialog-icon">
        <mat-icon>warning_amber</mat-icon>
      </div>
      <h2>{{ data.title }}</h2>
      <p>{{ data.message }}</p>
      <div class="dialog-actions">
        <button mat-stroked-button mat-dialog-close class="cancel-btn">Cancelar</button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true" class="confirm-btn">
          <mat-icon>delete_outline</mat-icon> Confirmar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-content {
      text-align: center;
      padding: 24px;
    }
    .dialog-icon {
      width: 56px; height: 56px;
      background: #fef2f2;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #ef4444; }
    }
    h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 8px; }
    p { font-size: 14px; color: #64748b; margin: 0 0 24px; line-height: 1.5; }
    .dialog-actions { display: flex; gap: 12px; justify-content: center; }
    .cancel-btn, .confirm-btn { border-radius: 8px !important; min-width: 120px; }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
  ) {}
}
