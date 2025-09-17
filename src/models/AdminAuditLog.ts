import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  targetType: 'USER' | 'EVENT' | 'BOOKING' | 'PROMO_CODE' | 'SYSTEM';
  targetId?: mongoose.Types.ObjectId;
  targetIdentifier?: string; // email, booking ID, etc.
  details: {
    before?: any;
    after?: any;
    reason?: string;
    metadata?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminEmail: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User actions
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_BAN',
      'USER_UNBAN',
      'USER_VERIFY',
      'USER_UNVERIFY',
      'USER_ROLE_CHANGE',
      'USER_PASSWORD_RESET',
      'USER_ACTIVATE',
      'USER_DEACTIVATE',
      // Event actions
      'EVENT_CREATE',
      'EVENT_UPDATE',
      'EVENT_DELETE',
      'EVENT_PUBLISH',
      'EVENT_UNPUBLISH',
      // Booking actions
      'BOOKING_UPDATE',
      'BOOKING_CANCEL',
      'BOOKING_REFUND',
      // Promo code actions
      'PROMO_CODE_CREATE',
      'PROMO_CODE_UPDATE',
      'PROMO_CODE_DELETE',
      'PROMO_CODE_ACTIVATE',
      'PROMO_CODE_DEACTIVATE',
      // System actions
      'SYSTEM_SETTINGS_UPDATE',
      'SYSTEM_BACKUP',
      'SYSTEM_MAINTENANCE',
      // Other
      'OTHER'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['USER', 'EVENT', 'BOOKING', 'PROMO_CODE', 'SYSTEM']
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: false
  },
  targetIdentifier: {
    type: String,
    trim: true
  },
  details: {
    before: {
      type: Schema.Types.Mixed
    },
    after: {
      type: Schema.Types.Mixed
    },
    reason: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for efficient querying
AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ action: 1, createdAt: -1 });
AdminAuditLogSchema.index({ targetType: 1, targetId: 1 });
AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ success: 1, createdAt: -1 });

// TTL index to automatically delete old logs after 2 years
AdminAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.models.AdminAuditLog || mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);