import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Header, Icon } from 'semantic-ui-react'

interface Props {
  setFiles: (files: any) => void;
}

export default function PhotoWidgetDropzone({ setFiles } : Props) {
  const dropzoneDefaultStyle = {
    border: 'dashed 3px #eee',
    borderColor: '#eee',
    borderRadius: '5px',
    paddingTop: '30px',
    textAlign: 'center' as 'center',
    height: 200
  }

  const dropzoneActiveStyle = {
    borderColor: 'green'
  }

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles.map((file: any) => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })))
  }, [setFiles])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div { ...getRootProps() } style={ isDragActive ? { ...dropzoneDefaultStyle, ...dropzoneActiveStyle } : dropzoneDefaultStyle }>
      <input { ...getInputProps() } />
      <Icon name='upload' size='huge' />
      <Header content='Drop image here' />
      {/* {
        isDragActive
          ? <p>Drop the files here ...</p>
          : <p>Drag 'n' drop some files here, or click to select files</p>
      } */}
    </div>
  )
}