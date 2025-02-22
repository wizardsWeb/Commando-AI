export class AudioProcessor {
    private audioChunks: Blob[] = []
    private mediaRecorder: MediaRecorder | null = null
    private recordingInterval: NodeJS.Timeout | null = null
  
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream)
  
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data)
          }
        }
  
        this.mediaRecorder.start()
  
        // Process audio chunks every 10 seconds
        this.recordingInterval = setInterval(() => {
          if (this.mediaRecorder?.state === "recording") {
            this.mediaRecorder.requestData()
            this.processAudioChunk()
          }
        }, 10000)
      } catch (error) {
        console.error("Error starting audio recording:", error)
      }
    }
  
    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      }
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval)
      }
    }
  
    private async processAudioChunk() {
      if (this.audioChunks.length === 0) return
  
      try {
        const audioContext = new window.AudioContext()
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
        const arrayBuffer = await audioBlob.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        const wavBlob = this.bufferToWave(audioBuffer)
  
        // Send to backend for processing
        const formData = new FormData()
        formData.append("audio", wavBlob, `audio_${Date.now()}.wav`)
  
        const response = await fetch("https://localhost3000/api/transcribe", {
          method: "POST",
          body: formData,
        })
  
        if (!response.ok) throw new Error("Failed to transcribe audio")
  
        // Clear processed chunks
        this.audioChunks = []
      } catch (error) {
        console.error("Error processing audio chunk:", error)
      }
    }
  
    private bufferToWave(abuffer: AudioBuffer): Blob {
      const numOfChannels = abuffer.numberOfChannels
      const length = abuffer.length * numOfChannels * 2 + 44
      const buffer = new ArrayBuffer(length)
      const view = new DataView(buffer)
      const channels: Float32Array[] = []
  
      for (let i = 0; i < numOfChannels; i++) {
        channels.push(abuffer.getChannelData(i))
      }
  
      // Write WAV header
      this.setString(view, 0, "RIFF")
      view.setUint32(4, length - 8, true)
      this.setString(view, 8, "WAVE")
      this.setString(view, 12, "fmt ")
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, numOfChannels, true)
      view.setUint32(24, abuffer.sampleRate, true)
      view.setUint32(28, abuffer.sampleRate * 2, true)
      view.setUint16(32, numOfChannels * 2, true)
      view.setUint16(34, 16, true)
      this.setString(view, 36, "data")
      view.setUint32(40, length - view.byteLength, true)
  
      // Write PCM samples
      let offset = 44
      for (let i = 0; i < abuffer.length; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, channels[channel][i]))
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
          offset += 2
        }
      }
  
      return new Blob([view], { type: "audio/wav" })
    }
  
    private setString(view: DataView, offset: number, string: string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
  }
  
  