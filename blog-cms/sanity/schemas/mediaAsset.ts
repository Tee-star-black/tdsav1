import {defineField,defineType} from 'sanity'

export const mediaAsset = defineType({
  name:'mediaAsset',
  title:'Editorial media',
  type:'document',
  fields:[
    defineField({name:'name',title:'Name',type:'string',validation:r=>r.required().min(2)}),
    defineField({name:'image',title:'Image',type:'image',options:{hotspot:true},validation:r=>r.required()}),
    defineField({name:'alt',title:'Alternative text',type:'string',description:'Describe the image for people using assistive technology.',validation:r=>r.required().min(3)}),
    defineField({name:'tag',title:'Editorial tag',type:'string',initialValue:'Uploaded'}),
  ],
  preview:{select:{title:'name',subtitle:'alt',media:'image'}},
})
