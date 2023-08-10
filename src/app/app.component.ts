import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkOutlineFilter from '@kitware/vtk.js/Filters/General/OutlineFilter';

import { readImageArrayBuffer } from 'itk-wasm'
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import vtkMouseCameraTrackballPanManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator';
import vtkMouseCameraTrackballZoomManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild("vtkContainer", { static: true })
  vtkContainer!: ElementRef

  @ViewChild("vtkContainer2", { static: true })
  vtkContainer2!: ElementRef

  @ViewChild("vtkContainer3", { static: true })
  vtkContainer3!: ElementRef




  //example1
  height = 1
  cone = vtkConeSource.newInstance({ height: this.height })
  interactor = vtkRenderWindowInteractor.newInstance()

  //example3




  ngOnInit(): void {
    this.example1()
    this.example2()
  }

  example1() {
    const renderWindow = vtkRenderWindow.newInstance()
    const renderer = vtkRenderer.newInstance()
    renderWindow.addRenderer(renderer)

    const openGlRenderWindow = vtkOpenGLRenderWindow.newInstance()
    openGlRenderWindow.setContainer(this.vtkContainer.nativeElement)
    //openGlRenderWindow.setSize(300, 300)
    renderWindow.addView(openGlRenderWindow)


    this.interactor.setView(openGlRenderWindow)
    this.interactor.initialize()
    this.interactor.bindEvents(this.vtkContainer.nativeElement)

    const trackball = vtkInteractorStyleTrackballCamera.newInstance()
    this.interactor.setInteractorStyle(trackball)


    const actor = vtkActor.newInstance()
    const mapper = vtkMapper.newInstance()

    actor.setMapper(mapper)
    mapper.setInputConnection(this.cone.getOutputPort())
    renderer.addActor(actor)

    renderer.resetCamera()
    renderWindow.render()
  }

  updateCone() {
    this.cone.setHeight(this.height / 100)
    this.interactor.render()
  }

  example2() {
    const renderWindow = vtkRenderWindow.newInstance()
    const renderer = vtkRenderer.newInstance()
    renderWindow.addRenderer(renderer)

    const openGlRenderWindow = vtkOpenGLRenderWindow.newInstance()
    openGlRenderWindow.setContainer(this.vtkContainer2.nativeElement)
    //openGlRenderWindow.setSize(300, 300)
    renderWindow.addView(openGlRenderWindow)

    const interactor = vtkRenderWindowInteractor.newInstance()
    interactor.setView(openGlRenderWindow)
    interactor.initialize()
    interactor.bindEvents(this.vtkContainer2.nativeElement)

    const trackball = vtkInteractorStyleTrackballCamera.newInstance()
    interactor.setInteractorStyle(trackball)


    const ball = vtkSphereSource.newInstance()

    const actor = vtkActor.newInstance()
    const mapper = vtkMapper.newInstance()
    actor.setMapper(mapper)

    mapper.setInputConnection(ball.getOutputPort())

    renderer.addActor(actor)


    const outlineActor = vtkActor.newInstance()
    const outlineMapper = vtkMapper.newInstance()
    outlineActor.setMapper(outlineMapper)

    const filter = vtkOutlineFilter.newInstance()

    filter.setInputConnection(ball.getOutputPort())

    outlineMapper.setInputConnection(filter.getOutputPort())


    renderer.addActor(outlineActor)

    renderer.resetCamera()
    renderWindow.render()

    setInterval(() => {
      const camera = renderer.getActiveCamera()
      camera.azimuth(1)
      interactor.render()
    }, 10)
  }

  example3() {
    const renderWindow = vtkRenderWindow.newInstance()
    const renderer = vtkRenderer.newInstance()
    renderWindow.addRenderer(renderer)

    const openGlRenderWindow = vtkOpenGLRenderWindow.newInstance()
    openGlRenderWindow.setContainer(this.vtkContainer3.nativeElement)
    //openGlRenderWindow.setSize(300, 300)
    renderWindow.addView(openGlRenderWindow)

    const interactor = vtkRenderWindowInteractor.newInstance()
    interactor.setView(openGlRenderWindow)
    interactor.initialize()
    interactor.bindEvents(this.vtkContainer3.nativeElement)

    const trackball = vtkInteractorStyleTrackballCamera.newInstance()
    interactor.setInteractorStyle(trackball)



    renderer.resetCamera()
    renderWindow.render()
  }

  onUpload(event: any) {
    const file: File = event.target.files[0]
    const reader = new FileReader
    reader.onload = async (iEvent: any) => {
      const arrayBuffer = iEvent.target.result;
      const uArr = new Uint8Array(arrayBuffer);

      const { image: itkImage, webWorker } = await readImageArrayBuffer(null, uArr.buffer, file.name, file.name)
      webWorker.terminate()
      const elem = vtkITKHelper.convertItkToVtkImage(itkImage)


      const renderWindow = vtkRenderWindow.newInstance()
      const renderer = vtkRenderer.newInstance()
      renderWindow.addRenderer(renderer)

      const openGlRenderWindow = vtkOpenGLRenderWindow.newInstance()
      openGlRenderWindow.setContainer(this.vtkContainer3.nativeElement)
      //openGlRenderWindow.setSize(300, 300)
      renderWindow.addView(openGlRenderWindow)


      const actor = vtkImageSlice.newInstance()
      const mapper = vtkImageMapper.newInstance()
      actor.setMapper(mapper)
      renderer.addActor(actor)

      mapper.setInputData(elem)


      const istyle = vtkInteractorStyleManipulator.newInstance();
      const interactor = vtkRenderWindowInteractor.newInstance()
      interactor.setView(openGlRenderWindow)
      interactor.initialize()
      interactor.bindEvents(this.vtkContainer3.nativeElement)
      interactor.setInteractorStyle(istyle)

      const mousePanning =
        vtkMouseCameraTrackballPanManipulator.newInstance({
          button: 1,
        });
      istyle.addMouseManipulator(mousePanning);

      const mouseZooming =
        vtkMouseCameraTrackballZoomManipulator.newInstance({
          button: 3,
        });
      istyle.addMouseManipulator(mouseZooming);


    


      // // Setup camera
      // const firstImage = collection.getItem(0);
      // const d9 = firstImage.getDirection();
      // const normal = [0, 0, 1];
      // const viewUp = [0, -1, 0];
      // vtkMath.multiply3x3_vect3(d9, normal, normal);
      // vtkMath.multiply3x3_vect3(d9, viewUp, viewUp);
      // const camera = renderer.getActiveCamera();
      // const focalPoint = firstImage.getCenter();
      // const position = focalPoint.map((e, i) => e - normal[i]); // offset along the slicing axis
      // camera.setPosition(...position);
      // camera.setFocalPoint(...focalPoint);
      // camera.setViewUp(viewUp);
      // renderer.resetCamera(); // adjust position along normal + zoom (parallel scale)

      // // Initial slice
      // const minSlice = 0;
      // const maxSlice = imageMapper.getTotalSlices() - 1;
      // console.log(`slices range: ${minSlice}, ${maxSlice}`);
      // const sliceStep = 1;
      // imageMapper.setSlice(0);


      renderWindow.render()



    }

    reader.readAsArrayBuffer(file)



  }


}
