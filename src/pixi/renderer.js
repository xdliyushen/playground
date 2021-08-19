/* eslint-disable */

/**
 * Called when the skew or the rotation changes.
 *
 * @protected
 */
Transform.prototype.updateSkew = function () {
    this._cx = Math.cos(this._rotation + this.skew.y);
    this._sx = Math.sin(this._rotation + this.skew.y);
    this._cy = -Math.sin(this._rotation - this.skew.x); // cos, added PI/2
    this._sy = Math.cos(this._rotation - this.skew.x); // sin, added PI/2
    this._localID++;
};

/**
 * The Renderer draws the scene and all its content onto a WebGL enabled canvas.
 *
 * This renderer should be used for browsers that support WebGL.
 *
 * This renderer works by automatically managing WebGLBatchesm, so no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything!
 *
 * Renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a renderer:
 *
 * | System                               | Description                                                                   |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link PIXI.BatchSystem}             | This manages object renderers that defer rendering until a flush.             |
 * | {@link PIXI.ContextSystem}           | This manages the WebGL context and extensions.                                |
 * | {@link PIXI.EventSystem}             | This manages UI events.                                                       |
 * | {@link PIXI.FilterSystem}            | This manages the filtering pipeline for post-processing effects.              |
 * | {@link PIXI.FramebufferSystem}       | This manages framebuffers, which are used for offscreen rendering.            |
 * | {@link PIXI.GeometrySystem}          | This manages geometries & buffers, which are used to draw object meshes.      |
 * | {@link PIXI.MaskSystem}              | This manages masking operations.                                              |
 * | {@link PIXI.ProjectionSystem}        | This manages the `projectionMatrix`, used by shaders to get NDC coordinates.  |
 * | {@link PIXI.RenderTextureSystem}     | This manages render-textures, which are an abstraction over framebuffers.     |
 * | {@link PIXI.ScissorSystem}           | This handles scissor masking, and is used internally by {@link MaskSystem}    |
 * | {@link PIXI.ShaderSystem}            | This manages shaders, programs that run on the GPU to calculate 'em pixels.   |
 * | {@link PIXI.StateSystem}             | This manages the WebGL state variables like blend mode, depth testing, etc.   |
 * | {@link PIXI.StencilSystem}           | This handles stencil masking, and is used internally by {@link MaskSystem}    |
 * | {@link PIXI.TextureSystem}           | This manages textures and their resources on the GPU.                         |
 * | {@link PIXI.TextureGCSystem}         | This will automatically remove textures from the GPU if they are not used.    |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.AbstractRenderer
 */
/**
 * Renders the object to its WebGL view
 *
 * @param {PIXI.DisplayObject} displayObject - The object to be rendered.
 * @param {PIXI.RenderTexture} [renderTexture] - The render texture to render to.
 * @param {boolean} [clear=true] - Should the canvas be cleared before the new render.
 * @param {PIXI.Matrix} [transform] - A transform to apply to the render texture before rendering.
 * @param {boolean} [skipUpdateTransform=false] - Should we skip the update transform pass?
 */
Renderer.prototype.render = function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
    // ...

    // apply a transform at a GPU level
    this.projection.transform = transform;

    // ...

    if (!skipUpdateTransform) {
        var cacheParent = displayObject.enableTempParent();
        // 应用变换矩阵(递归)
        displayObject.updateTransform();
        displayObject.disableTempParent(cacheParent);
    }

    // todo 怎么知道哪些东西该渲染？
    // todo 缓冲帧是干嘛的？
    // 基于要渲染的纹理, 创建、绑定缓冲帧 更新全局变换矩阵
    this.renderTexture.bind(renderTexture);
    // 更新 gl 设置、更新 shader、更新坐标
    this.batch.currentRenderer.start();

    if (clear !== undefined ? clear : this.clearBeforeRender) {
        // todo 缓冲区是干嘛的？
        // 清除画布的背景色和缓冲区
        this.renderTexture.clear();
    }

    // 更新 buffer 数据
    displayObject.render(this);

    // 真正进行绘图的地方
    this.batch.currentRenderer.flush();

    // ...
};

/**
 * Updates the transform on all children of this container for rendering
 */
Container.prototype.updateTransform = function () {
    // ...

    // 应用父元素的变换矩阵
    this.transform.updateTransform(this.parent.transform);

    // ...

    // 递归子元素
    for (var i = 0, j = this.children.length; i < j; ++i) {
        var child = this.children[i];
        if (child.visible) {
            child.updateTransform();
        }
    }
};

/**
* Updates the local and the world transformation matrices.
*
* @param {PIXI.Transform} parentTransform - The parent transform
*/
Transform.prototype.updateTransform = function (parentTransform) {
    var lt = this.localTransform;
    // 根据 _localID 来判断的, 在更改 rotation 时, _localID 发生了变化, 变化后才会更改图像的 transform matrix!!
    if (this._localID !== this._currentLocalID) {
        // get the matrix values of the displayobject based on its transform properties..
        lt.a = this._cx * this.scale.x;
        lt.b = this._sx * this.scale.x;
        lt.c = this._cy * this.scale.y;
        lt.d = this._sy * this.scale.y;
        lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
        lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));
        this._currentLocalID = this._localID;
        // force an update..
        this._parentID = -1;
    }
    if (this._parentID !== parentTransform._worldID) {
        // concat the parent matrix with the objects transform.
        var pt = parentTransform.worldTransform;
        var wt = this.worldTransform;
        wt.a = (lt.a * pt.a) + (lt.b * pt.c);
        wt.b = (lt.a * pt.b) + (lt.b * pt.d);
        wt.c = (lt.c * pt.a) + (lt.d * pt.c);
        wt.d = (lt.c * pt.b) + (lt.d * pt.d);
        wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
        wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;
        this._parentID = parentTransform._worldID;
        // update the id of the transform..
        this._worldID++;
    }
};

/**
 * Bind the current render texture
 *
 * @param {PIXI.RenderTexture} [renderTexture] - RenderTexture to bind, by default its `null`, the screen
 * @param {PIXI.Rectangle} [sourceFrame] - part of screen that is mapped to the renderTexture
 * @param {PIXI.Rectangle} [destinationFrame] - part of renderTexture, by default it has the same size as sourceFrame
 */
RenderTextureSystem.prototype.bind = function (renderTexture, sourceFrame, destinationFrame) {
    // ...
    // 构建 sourceFrame 和 destinationFrame

    // activeFrameBuffer bindFramebuffer setViewport
    // 通过绑定帧缓冲绘制到纹理、告诉WebGL如何从裁剪空间映射到像素空间
    this.renderer.framebuffer.bind(framebuffer, viewportFrame);

    // 应用 projection matrix
    this.renderer.projection.update(destinationFrame, sourceFrame, resolution, !framebuffer);

    // 设置遮罩
    if (renderTexture) {
        this.renderer.mask.setMaskStack(baseTexture.maskStack);
    }
    else {
        this.renderer.mask.setMaskStack(this.defaultMaskStack);
    }

    this.sourceFrame.copyFrom(sourceFrame);
    this.destinationFrame.copyFrom(destinationFrame);
};

/**
* Starts a new sprite batch.
*/
AbstractBatchRenderer.prototype.start = function () {
    // 更新 webgl state, 如 blend mode, depth 等
    this.renderer.state.set(this.state);
    // 更新着色器
    this.renderer.shader.bind(this._shader);
    if (_pixi_settings__WEBPACK_IMPORTED_MODULE_0__["settings"].CAN_UPLOAD_SAME_BUFFER) {
        // bind buffer #0, we don't need others
        // 更新 buffer 数据
        this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
    }
};

/**
 * Changes the current shader to the one given in parameter
 *
 * @param {PIXI.Shader} shader - the new shader
 * @param {boolean} [dontSync] - false if the shader should automatically sync its uniforms.
 * @returns {PIXI.GLProgram} the glProgram that belongs to the shader.
 */
ShaderSystem.prototype.bind = function (shader, dontSync) {
    shader.uniforms.globals = this.renderer.globalUniforms;
    var program = shader.program;
    var glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateShader(shader);
    this.shader = shader;
    // TODO - some current Pixi plugins bypass this.. so it not safe to use yet..
    if (this.program !== program) {
        this.program = program;
        this.gl.useProgram(glProgram.program);
    }
    if (!dontSync) {
        defaultSyncData.textureCount = 0;
        this.syncUniformGroup(shader.uniformGroup, defaultSyncData);
    }
    return glProgram;
};

/**
 * Binds geometry so that is can be drawn. Creating a Vao if required
 *
 * @param {PIXI.Geometry} geometry - instance of geometry to bind
 * @param {PIXI.Shader} [shader] - instance of shader to use vao for
 */
GeometrySystem.prototype.bind = function (geometry, shader) {
    shader = shader || this.renderer.shader.shader;
    var gl = this.gl;
    // not sure the best way to address this..
    // currently different shaders require different VAOs for the same geometry
    // Still mulling over the best way to solve this one..
    // will likely need to modify the shader attribute locations at run time!
    var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
    var incRefCount = false;
    if (!vaos) {
        this.managedGeometries[geometry.id] = geometry;
        geometry.disposeRunner.add(this);
        geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
        incRefCount = true;
    }
    var vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program, incRefCount);
    this._activeGeometry = geometry;
    if (this._activeVao !== vao) {
        this._activeVao = vao;
        if (this.hasVao) {
            gl.bindVertexArray(vao);
        }
        else {
            this.activateVao(geometry, shader.program);
        }
    }
    // TODO - optimise later!
    // don't need to loop through if nothing changed!
    // maybe look to add an 'autoupdate' to geometry?
    this.updateBuffers();
};

/**
 * Update buffers
 * @protected
 */
GeometrySystem.prototype.updateBuffers = function () {
    var geometry = this._activeGeometry;
    var gl = this.gl;
    for (var i = 0; i < geometry.buffers.length; i++) {
        var buffer = geometry.buffers[i];
        var glBuffer = buffer._glBuffers[this.CONTEXT_UID];
        // todo 通过 id 来区分是否更新 buffer 这个 id 是在哪里变化的？？
        if (buffer._updateID !== glBuffer.updateID) {
            glBuffer.updateID = buffer._updateID;
            // TODO can cache this on buffer! maybe added a getter / setter?
            var type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
            // TODO this could change if the VAO changes...
            // need to come up with a better way to cache..
            // if (this.boundBuffers[type] !== glBuffer)
            // {
            // this.boundBuffers[type] = glBuffer;
            gl.bindBuffer(type, glBuffer.buffer);
            // }
            this._boundBuffer = glBuffer;
            if (glBuffer.byteLength >= buffer.data.byteLength) {
                // offset is always zero for now!
                gl.bufferSubData(type, 0, buffer.data);
            }
            else {
                var drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
                glBuffer.byteLength = buffer.data.byteLength;
                gl.bufferData(type, buffer.data, drawType);
            }
        }
    }
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param {PIXI.Renderer} renderer - The renderer
 */
Container.prototype.render = function (renderer) {
    // if the object is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
        return;
    }
    // do a quick check to see if this element has a mask or a filter.
    if (this._mask || (this.filters && this.filters.length)) {
        this.renderAdvanced(renderer);
    } else {
        this._render(renderer);
        // simple render children!
        for (var i = 0, j = this.children.length; i < j; ++i) {
            this.children[i].render(renderer);
        }
    }
};

// todo 看看两帧之间的 rotation 有没有变化 540
Sprite.prototype._render = function (renderer) {
    // 计算
    this.calculateVertices();
    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
};

/**
 * Changes the current renderer to the one given in parameter
 *
 * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
 */
BatchSystem.prototype.setObjectRenderer = function (objectRenderer) {
    if (this.currentRenderer === objectRenderer) {
        return;
    }
    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
};

// todo 有没有办法减少 _bufferedElements 和 _bufferedTextures 的数量？
/**
 * Buffers the "batchable" object. It need not be rendered
 * immediately.
 *
 * @param {PIXI.DisplayObject} element - the element to render when
 *    using this renderer
 */
AbstractBatchRenderer.prototype.render = function (element) {
    if (!element._texture.valid) {
        return;
    }
    if (this._vertexCount + (element.vertexData.length / 2) > this.size) {
        this.flush();
    }
    this._vertexCount += element.vertexData.length / 2;
    this._indexCount += element.indices.length;
    this._bufferedTextures[this._bufferSize] = element._texture.baseTexture;
    this._bufferedElements[this._bufferSize++] = element;
};

/**
 * Renders the content _now_ and empties the current batch.
 */
AbstractBatchRenderer.prototype.flush = function () {
    if (this._vertexCount === 0) {
        return;
    }
    this._attributeBuffer = this.getAttributeBuffer(this._vertexCount);
    this._indexBuffer = this.getIndexBuffer(this._indexCount);
    this._aIndex = 0;
    this._iIndex = 0;
    this._dcIndex = 0;
    this.buildTexturesAndDrawCalls();
    this.updateGeometry();
    this.drawBatches();
    // reset elements buffer for the next flush
    this._bufferSize = 0;
    this._vertexCount = 0;
    this._indexCount = 0;
};

AbstractBatchRenderer.prototype.buildTexturesAndDrawCalls = function () {
    var _a = this, textures = _a._bufferedTextures, MAX_TEXTURES = _a.MAX_TEXTURES;
    var textureArrays = AbstractBatchRenderer._textureArrayPool;
    var batch = this.renderer.batch;
    var boundTextures = this._tempBoundTextures;
    var touch = this.renderer.textureGC.count;
    var TICK = ++BaseTexture._globalBatch;
    var countTexArrays = 0;
    var texArray = textureArrays[0];
    var start = 0;
    batch.copyBoundTextures(boundTextures, MAX_TEXTURES);
    for (var i = 0; i < this._bufferSize; ++i) {
        var tex = textures[i];
        textures[i] = null;
        if (tex._batchEnabled === TICK) {
            continue;
        }
        if (texArray.count >= MAX_TEXTURES) {
            batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
            this.buildDrawCalls(texArray, start, i);
            start = i;
            texArray = textureArrays[++countTexArrays];
            ++TICK;
        }
        tex._batchEnabled = TICK;
        tex.touched = touch;
        texArray.elements[texArray.count++] = tex;
    }
    if (texArray.count > 0) {
        batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
        this.buildDrawCalls(texArray, start, this._bufferSize);
        ++countTexArrays;
        ++TICK;
    }
    // Clean-up
    for (var i = 0; i < boundTextures.length; i++) {
        boundTextures[i] = null;
    }
    BaseTexture._globalBatch = TICK;
};

/**
     * Populating drawcalls for rendering
     *
     * @param {PIXI.BatchTextureArray} texArray
     * @param {number} start
     * @param {number} finish
     */
AbstractBatchRenderer.prototype.buildDrawCalls = function (texArray, start, finish) {
    var _a = this, elements = _a._bufferedElements, _attributeBuffer = _a._attributeBuffer, _indexBuffer = _a._indexBuffer, vertexSize = _a.vertexSize;
    var drawCalls = AbstractBatchRenderer._drawCallPool;
    var dcIndex = this._dcIndex;
    var aIndex = this._aIndex;
    var iIndex = this._iIndex;
    var drawCall = drawCalls[dcIndex];
    drawCall.start = this._iIndex;
    drawCall.texArray = texArray;
    for (var i = start; i < finish; ++i) {
        var sprite = elements[i];
        var tex = sprite._texture.baseTexture;
        var spriteBlendMode = _pixi_utils__WEBPACK_IMPORTED_MODULE_2__["premultiplyBlendMode"][tex.alphaMode ? 1 : 0][sprite.blendMode];
        elements[i] = null;
        if (start < i && drawCall.blend !== spriteBlendMode) {
            drawCall.size = iIndex - drawCall.start;
            start = i;
            drawCall = drawCalls[++dcIndex];
            drawCall.texArray = texArray;
            drawCall.start = iIndex;
        }
        this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
        aIndex += sprite.vertexData.length / 2 * vertexSize;
        iIndex += sprite.indices.length;
        drawCall.blend = spriteBlendMode;
    }
    if (start < finish) {
        drawCall.size = iIndex - drawCall.start;
        ++dcIndex;
    }
    this._dcIndex = dcIndex;
    this._aIndex = aIndex;
    this._iIndex = iIndex;
};

/**
     * Takes the four batching parameters of `element`, interleaves
     * and pushes them into the batching attribute/index buffers given.
     *
     * It uses these properties: `vertexData` `uvs`, `textureId` and
     * `indicies`. It also uses the "tint" of the base-texture, if
     * present.
     *
     * @param {PIXI.Sprite} element - element being rendered
     * @param {PIXI.ViewableBuffer} attributeBuffer - attribute buffer.
     * @param {Uint16Array} indexBuffer - index buffer
     * @param {number} aIndex - number of floats already in the attribute buffer
     * @param {number} iIndex - number of indices already in `indexBuffer`
     */
AbstractBatchRenderer.prototype.packInterleavedGeometry = function (element, attributeBuffer, indexBuffer, aIndex, iIndex) {
    var uint32View = attributeBuffer.uint32View, float32View = attributeBuffer.float32View;
    var packedVertices = aIndex / this.vertexSize;
    var uvs = element.uvs;
    var indicies = element.indices;
    var vertexData = element.vertexData;
    var textureId = element._texture.baseTexture._batchLocation;
    var alpha = Math.min(element.worldAlpha, 1.0);
    var argb = (alpha < 1.0
        && element._texture.baseTexture.alphaMode)
        ? Object(_pixi_utils__WEBPACK_IMPORTED_MODULE_2__["premultiplyTint"])(element._tintRGB, alpha)
        : element._tintRGB + (alpha * 255 << 24);
    // lets not worry about tint! for now..
    for (var i = 0; i < vertexData.length; i += 2) {
        float32View[aIndex++] = vertexData[i];
        float32View[aIndex++] = vertexData[i + 1];
        float32View[aIndex++] = uvs[i];
        float32View[aIndex++] = uvs[i + 1];
        uint32View[aIndex++] = argb;
        float32View[aIndex++] = textureId;
    }
    for (var i = 0; i < indicies.length; i++) {
        indexBuffer[iIndex++] = packedVertices + indicies[i];
    }
};