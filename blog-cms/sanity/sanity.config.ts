import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  'glz6ptd8'

export default defineConfig({
  name: 'teledoctorsa-publishing-studio',
  title: 'TeleDoctorSA Publishing Studio',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production',
  plugins: [deskTool(), visionTool()],
  schema: {types: schemaTypes},
})
