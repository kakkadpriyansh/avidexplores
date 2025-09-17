import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // For nested replies
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  likes: number;
  dislikes: number;
  isEdited: boolean;
  editedAt?: Date;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationReason?: string;
  // User info for guest comments
  guestInfo?: {
    name: string;
    email: string;
    website?: string;
  };
  // Spam detection
  spamScore?: number;
  ipAddress?: string;
  userAgent?: string;
  // Reactions
  reactions: {
    helpful: number;
    funny: number;
    insightful: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must be at least 1 character'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.guestInfo;
    }
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog reference is required']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'],
    default: 'PENDING'
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation reason cannot exceed 500 characters']
  },
  guestInfo: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    }
  },
  spamScore: {
    type: Number,
    min: 0,
    max: 100
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  reactions: {
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    funny: {
      type: Number,
      default: 0,
      min: 0
    },
    insightful: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
CommentSchema.index({ blog: 1, status: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ status: 1, createdAt: -1 });
CommentSchema.index({ likes: -1 });
CommentSchema.index({ createdAt: -1 });

// Text search index
CommentSchema.index({
  content: 'text'
});

// Pre-save middleware
CommentSchema.pre('save', function(next) {
  // Mark as edited if content is modified
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }

  // Validate that either author or guestInfo is provided
  if (!this.author && !this.guestInfo) {
    return next(new Error('Either author or guest information must be provided'));
  }

  // If guestInfo is provided, ensure required fields are present
  if (this.guestInfo && (!this.guestInfo.name || !this.guestInfo.email)) {
    return next(new Error('Guest name and email are required'));
  }

  next();
});

// Virtual for total reactions
CommentSchema.virtual('totalReactions').get(function() {
  return this.reactions.helpful + this.reactions.funny + this.reactions.insightful;
});

// Virtual for comment depth (for nested comments)
CommentSchema.virtual('depth').get(function() {
  // This would need to be calculated based on parent chain
  // For now, return 0 for top-level, 1 for replies
  return this.parentComment ? 1 : 0;
});

// Virtual for author display name
CommentSchema.virtual('authorName').get(function() {
  if (this.guestInfo) {
    return this.guestInfo.name;
  }
  // This would be populated from the User model
  return 'Anonymous';
});

// Static method to get comments with replies
CommentSchema.statics.getCommentsWithReplies = function(blogId: string, status = 'APPROVED') {
  return this.aggregate([
    {
      $match: {
        blog: new mongoose.Types.ObjectId(blogId),
        status: status,
        isActive: true,
        parentComment: null // Only top-level comments
      }
    },
    {
      $lookup: {
        from: 'comments',
        let: { commentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$parentComment', '$$commentId'] },
                  { $eq: ['$status', status] },
                  { $eq: ['$isActive', true] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'author',
              foreignField: '_id',
              as: 'authorInfo'
            }
          },
          {
            $sort: { createdAt: 1 }
          }
        ],
        as: 'replies'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorInfo'
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
};

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);