// models/File.ts
import { Schema, model, models } from 'mongoose'

const FileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const File = models.File || model('File', FileSchema)
export default File
