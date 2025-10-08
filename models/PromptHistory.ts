import { Schema, model, models } from 'mongoose'

const PromptHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  llmUsed: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const PromptHistory = models.PromptHistory || model('PromptHistory', PromptHistorySchema)
export default PromptHistory
