import { Dropzone } from "dropzone"

import { cutString, sendData, showBigImgModal, showInfoModal } from "../_functions"


const genDropzones = document.querySelectorAll('.general-dropzone')

if (genDropzones) {
  genDropzones.forEach(dropzoneEl => {

    const addBtn = dropzoneEl.closest('.general-dropzone-wrapper')?.querySelector('.general-dropzone__add-btn')

    const amountFiles = dropzoneEl.closest('.general-dropzone-wrapper')?.querySelector('.general-dropzone-amount')

    const isBigPreview = dropzoneEl.dataset.showPreview



    // Обновление счетчика файлов
    const updateAmountFiles = () => {
      if (amountFiles) {
        amountFiles.textContent = dropzoneEl.querySelectorAll('.dz-preview').length.toString()
      }
    }

    // Добавление просмотра большой версии превью

    const onShowBig = (file) => {

      if (isBigPreview) {
        const previewPic = file.previewElement

        if (previewPic) {
          const previewImg = previewPic.querySelector('img')
          previewImg.setAttribute('data-big-img', file.dataURL)
          previewPic.addEventListener('click', () => {
            showBigImgModal(file.dataURL)
          })
        }
      }
    }


    const dataObj = JSON.parse(dropzoneEl.dataset.generalInfo)
    const {
      url,
      width,
      height,
      type,
      filesCount,
      removeUrl,
      additional,
      acceptedFiles,
      customText
    } = dataObj

    const newGenDropzone = new Dropzone(dropzoneEl, {
      maxFilesize: 5,
      url: url,
      maxFiles: filesCount,
      acceptedFiles: acceptedFiles,
      addRemoveLinks: true,
      thumbnailWidth: width,
      thumbnailHeight: height,

      clickable: addBtn || '.dz-message',
      removedfile: async function (file) {
        const data = {
          filetype: type,
          id_file: file._removeLink.dataset.id
        }

        const jsonData = JSON.stringify(data)
        const response = await sendData(jsonData, removeUrl)
        const finishedResponse = await response.json()

        const {status, errortext} = finishedResponse

        if (status === 'ok') {
          if (file.previewElement != null && file.previewElement.parentNode != null) {
            file.previewElement.parentNode.removeChild(file.previewElement)

            if (dropzoneEl.querySelectorAll('.dz-preview').length < filesCount) {
              addBtn?.classList.remove('btn_disabled')
            }
            updateAmountFiles()
          }
        } else {
          showInfoModal(errortext)
        }
      }
    })

    newGenDropzone.on("sending", function (file, xhr, formData) {
      formData.append("filetype", type)
      formData.append("additional", additional)

      if (addBtn?.dataset.id) {
        formData.append("id_item", addBtn.dataset.id)
      }

    })

    newGenDropzone.on("error", function (file) {
      if (customText) {
        showInfoModal(customText)
      } else {
        showInfoModal('Ошибка 404')
      }
      file.previewElement.parentNode.removeChild(file.previewElement)
    })

    newGenDropzone.on("success", function (file, response) {
      const resObj = JSON.parse(response)
      const {status, errortext, id_person} = resObj

      if (status !== 'ok') {
        showInfoModal(errortext)
        file.previewElement.parentNode.removeChild(file.previewElement)
      } else {
        const cutTitles = dropzoneEl.querySelectorAll('span[data-dz-name]')

        if (dropzoneEl.querySelectorAll('.dz-preview').length >= filesCount) {
          addBtn?.classList.add('btn_disabled')
        }

        if (cutTitles) {
          cutString(cutTitles, 12)
        }

        updateAmountFiles()
        onShowBig(file)
        file._removeLink.setAttribute('data-id', id_person)
      }
    })

    const existingFiles = dropzoneEl.querySelectorAll('.dz-preview')
    if (existingFiles.length > 0) {

      if (existingFiles.length >= filesCount) {
        addBtn?.classList.add('btn_disabled')
      }

      updateAmountFiles()


      existingFiles.forEach(el => {
        const deleteBtn = el.querySelector('.dz-remove')

        if (isBigPreview) {
          const previewImg = el.querySelector('.dz-image img')
          if (previewImg) {
            previewImg.addEventListener('click', () => {
              showBigImgModal(previewImg.dataset.bigImg)
            })
          }
        }

        deleteBtn.addEventListener('click', async (e) => {
          const data = {
            filetype: type,
            id_file: e.target.dataset.id
          }
          const jsonData = JSON.stringify(data)
          const response = await sendData(jsonData, removeUrl)
          const finishedResponse = await response.json()

          const {status, errortext} = finishedResponse
          if (status === 'ok') {
            el.parentNode.removeChild(el)
            if (dropzoneEl.querySelectorAll('.dz-preview').length < filesCount) {
              addBtn?.classList.remove('btn_disabled')
            }
            updateAmountFiles()
          } else {
            showInfoModal(errortext)
          }
        })
      })
    }
  })
}


