(function () {
    'use strict';

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    // Create Squeak VM namespace
    if (!self.Squeak) self.Squeak = {};

    // Setup a storage for settings
    if (!Squeak.Settings) {
        // Try (a working) localStorage and fall back to regular dictionary otherwise
        var settings;
        try {
            // fails in restricted iframe
            settings = self.localStorage;
            settings["squeak-foo:"] = "bar";
            if (settings["squeak-foo:"] !== "bar") throw Error();
            delete settings["squeak-foo:"];
        } catch(e) {
            settings = {};
        }
        Squeak.Settings = settings;
    }

    if (!Object.extend) {
        // Extend object by adding specified properties
        Object.extend = function(obj /* + more args */ ) {
            // skip arg 0, copy properties of other args to obj
            for (var i = 1; i < arguments.length; i++)
                if (typeof arguments[i] == 'object')
                    for (var name in arguments[i])
                        obj[name] = arguments[i][name];
        };
    }


    // This mimics the Lively Kernel's subclassing scheme.
    // When running there, Lively's subclasses and modules are used.
    // Modules serve as namespaces in Lively. SqueakJS uses a flat namespace
    // named "Squeak", but the code below still supports hierarchical names.
    if (!Function.prototype.subclass) {
        // Create subclass using specified class path and given properties
        Function.prototype.subclass = function(classPath /* + more args */ ) {
            // create subclass
            var subclass = function() {
                if (this.initialize) this.initialize.apply(this, arguments);
                return this;
            };
            // set up prototype
            var protoclass = function() { };
            protoclass.prototype = this.prototype;
            subclass.prototype = new protoclass();
            // skip arg 0, copy properties of other args to prototype
            for (var i = 1; i < arguments.length; i++)
                Object.extend(subclass.prototype, arguments[i]);
            // add class to namespace
            var path = classPath.split("."),
                className = path.pop(),
                // Walk path starting at the global namespace (self)
                // creating intermediate namespaces if necessary
                namespace = path.reduce(function(namespace, path) {
                    if (!namespace[path]) namespace[path] = {};
                    return namespace[path];
                }, self);
            namespace[className] = subclass;
            return subclass;
        };

    }

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.extend(Squeak,
    "version", {
        // system attributes
        vmVersion: "SqueakJS 1.0.3",
        vmDate: "2021-03-21",               // Maybe replace at build time?
        vmBuild: "unknown",                 // or replace at runtime by last-modified?
        vmPath: "unknown",                  // Replace at runtime
        vmFile: "vm.js",
        vmMakerVersion: "[VMMakerJS-bf.17 VMMaker-bf.353]", // for Smalltalk vmVMMakerVersion
        platformName: "JS",
        platformSubtype: "unknown",         // Replace at runtime
        osVersion: "unknown",               // Replace at runtime
        windowSystem: "unknown",            // Replace at runtime
    },
    "object header", {
        // object headers
        HeaderTypeMask: 3,
        HeaderTypeSizeAndClass: 0, //3-word header
        HeaderTypeClass: 1,        //2-word header
        HeaderTypeFree: 2,         //free block
        HeaderTypeShort: 3,        //1-word header
    },
    "special objects", {
        // Indices into SpecialObjects array
        splOb_NilObject: 0,
        splOb_FalseObject: 1,
        splOb_TrueObject: 2,
        splOb_SchedulerAssociation: 3,
        splOb_ClassBitmap: 4,
        splOb_ClassInteger: 5,
        splOb_ClassString: 6,
        splOb_ClassArray: 7,
        splOb_SmalltalkDictionary: 8,
        splOb_ClassFloat: 9,
        splOb_ClassMethodContext: 10,
        splOb_ClassBlockContext: 11,
        splOb_ClassPoint: 12,
        splOb_ClassLargePositiveInteger: 13,
        splOb_TheDisplay: 14,
        splOb_ClassMessage: 15,
        splOb_ClassCompiledMethod: 16,
        splOb_TheLowSpaceSemaphore: 17,
        splOb_ClassSemaphore: 18,
        splOb_ClassCharacter: 19,
        splOb_SelectorDoesNotUnderstand: 20,
        splOb_SelectorCannotReturn: 21,
        splOb_TheInputSemaphore: 22,
        splOb_SpecialSelectors: 23,
        splOb_CharacterTable: 24,
        splOb_SelectorMustBeBoolean: 25,
        splOb_ClassByteArray: 26,
        splOb_ClassProcess: 27,
        splOb_CompactClasses: 28,
        splOb_TheTimerSemaphore: 29,
        splOb_TheInterruptSemaphore: 30,
        splOb_FloatProto: 31,
        splOb_SelectorCannotInterpret: 34,
        splOb_MethodContextProto: 35,
        splOb_ClassBlockClosure: 36,
        splOb_ClassFullBlockClosure: 37,
        splOb_ExternalObjectsArray: 38,
        splOb_ClassPseudoContext: 39,
        splOb_ClassTranslatedMethod: 40,
        splOb_TheFinalizationSemaphore: 41,
        splOb_ClassLargeNegativeInteger: 42,
        splOb_ClassExternalAddress: 43,
        splOb_ClassExternalStructure: 44,
        splOb_ClassExternalData: 45,
        splOb_ClassExternalFunction: 46,
        splOb_ClassExternalLibrary: 47,
        splOb_SelectorAboutToReturn: 48,
        splOb_SelectorRunWithIn: 49,
        splOb_SelectorAttemptToAssign: 50,
        splOb_PrimErrTableIndex: 51,
        splOb_ClassAlien: 52,
        splOb_InvokeCallbackSelector: 53,
        splOb_ClassUnsafeAlien: 54,
        splOb_ClassWeakFinalizer: 55,
    },
    "known classes", {
        // AdditionalMethodState layout:
        AdditionalMethodState_selector: 1,
        // Class layout:
        Class_superclass: 0,
        Class_mdict: 1,
        Class_format: 2,
        Class_instVars: null,   // 3 or 4 depending on image, see instVarNames()
        Class_name: 6,
        // ClassBinding layout:
        ClassBinding_value: 1,
        // Context layout:
        Context_sender: 0,
        Context_instructionPointer: 1,
        Context_stackPointer: 2,
        Context_method: 3,
        Context_closure: 4,
        Context_receiver: 5,
        Context_tempFrameStart: 6,
        Context_smallFrameSize: 16,
        Context_largeFrameSize: 56,
        BlockContext_caller: 0,
        BlockContext_argumentCount: 3,
        BlockContext_initialIP: 4,
        BlockContext_home: 5,
        // Closure layout:
        Closure_outerContext: 0,
        Closure_startpc: 1,
        Closure_numArgs: 2,
        Closure_firstCopiedValue: 3,
        ClosureFull_method: 1,
        ClosureFull_receiver: 3,
        ClosureFull_firstCopiedValue: 4,
        // Stream layout:
        Stream_array: 0,
        Stream_position: 1,
        Stream_limit: 2,
        //ProcessorScheduler layout:
        ProcSched_processLists: 0,
        ProcSched_activeProcess: 1,
        //Link layout:
        Link_nextLink: 0,
        //LinkedList layout:
        LinkedList_firstLink: 0,
        LinkedList_lastLink: 1,
        //Semaphore layout:
        Semaphore_excessSignals: 2,
        //Mutex layout:
        Mutex_owner: 2,
        //Process layout:
        Proc_suspendedContext: 1,
        Proc_priority: 2,
        Proc_myList: 3,
        // Association layout:
        Assn_key: 0,
        Assn_value: 1,
        // MethodDict layout:
        MethodDict_array: 1,
        MethodDict_selectorStart: 2,
        // Message layout
        Message_selector: 0,
        Message_arguments: 1,
        Message_lookupClass: 2,
        // Point layout:
        Point_x: 0,
        Point_y: 1,
        // LargeInteger layout:
        LargeInteger_bytes: 0,
        LargeInteger_neg: 1,
        // WeakFinalizationList layout:
        WeakFinalizationList_first: 0,
        // WeakFinalizerItem layout:
        WeakFinalizerItem_list: 0,
        WeakFinalizerItem_next: 1,
    },
    "constants", {
        MinSmallInt: -0x40000000,
        MaxSmallInt:  0x3FFFFFFF,
        NonSmallInt: -0x50000000,           // non-small and neg (so non pos32 too)
        MillisecondClockMask: 0x1FFFFFFF,
    },
    "error codes", {
        PrimNoErr: 0,
        PrimErrGenericFailure: 1,
        PrimErrBadReceiver: 2,
        PrimErrBadArgument: 3,
        PrimErrBadIndex: 4,
        PrimErrBadNumArgs: 5,
        PrimErrInappropriate: 6,
        PrimErrUnsupported: 7,
        PrimErrNoModification: 8,
        PrimErrNoMemory: 9,
        PrimErrNoCMemory: 10,
        PrimErrNotFound: 11,
        PrimErrBadMethod: 12,
        PrimErrNamedInternal: 13,
        PrimErrObjectMayMove: 14,
        PrimErrLimitExceeded: 15,
        PrimErrObjectIsPinned: 16,
        PrimErrWritePastObject: 17,
    },
    "modules", {
        // don't clobber registered modules
        externalModules: Squeak.externalModules || {},
        registerExternalModule: function(name, module) {
            this.externalModules[name] = module;
        },
    },
    "time", {
        Epoch: Date.UTC(1901,0,1) + (new Date()).getTimezoneOffset()*60000,        // local timezone
        EpochUTC: Date.UTC(1901,0,1),
        totalSeconds: function() {
            // seconds since 1901-01-01, local time
            return Math.floor((Date.now() - Squeak.Epoch) / 1000);
        },
    },
    "utils", {
        bytesAsString: function(bytes) {
            var chars = [];
            for (var i = 0; i < bytes.length; )
                chars.push(String.fromCharCode.apply(
                    null, bytes.subarray(i, i += 16348)));
            return chars.join('');
        },
        word64FromUint32: function(hi, lo) {
            // Max safe integer as Uint64: 001FFFFF_FFFFFFFF
            // Min safe integer as Uint64: FFE00000_00000001
            if (hi < 0x00200000) { // positive, <= 53 bits
                return hi * 0x100000000 + lo;
            } else if (hi > 0xFFE00000) { // negative, <= 53 bits
                return (hi>>0) * 0x100000000 + lo;
            } else return [hi, lo]; // probably SmallFloat
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.Object',
    'initialization', {
        initInstanceOf: function(aClass, indexableSize, hash, nilObj) {
            this.sqClass = aClass;
            this.hash = hash;
            var instSpec = aClass.pointers[Squeak.Class_format],
                instSize = ((instSpec>>1) & 0x3F) + ((instSpec>>10) & 0xC0) - 1; //0-255
            this._format = (instSpec>>7) & 0xF; //This is the 0-15 code

            if (this._format < 8) {
                if (this._format != 6) {
                    if (instSize + indexableSize > 0)
                        this.pointers = this.fillArray(instSize + indexableSize, nilObj);
                } else // Words
                    if (indexableSize > 0)
                        if (aClass.isFloatClass) {
                            this.isFloat = true;
                            this.float = 0.0;
                        } else
                            this.words = new Uint32Array(indexableSize);
            } else // Bytes
                if (indexableSize > 0) {
                    // this._format |= -indexableSize & 3;       //deferred to writeTo()
                    this.bytes = new Uint8Array(indexableSize); //Methods require further init of pointers
                }

    //      Definition of Squeak's format code...
    //
    //      Pointers only...
    //        0      no fields
    //        1      fixed fields only (all containing pointers)
    //        2      indexable fields only (all containing pointers)
    //        3      both fixed and indexable fields (all containing pointers)
    //        4      both fixed and indexable weak fields (all containing pointers).
    //        5      unused
    //      Bits only...
    //        6      indexable word fields only (no pointers)
    //        7      unused
    //        8-11   indexable byte fields only (no pointers) (low 2 bits are low 2 bits of size)
    //      Pointer and bits (CompiledMethods only)...
    //       12-15   compiled methods:
    //               # of literal oops specified in method header,
    //               followed by indexable bytes (same interpretation of low 2 bits as above)
        },
        initAsClone: function(original, hash) {
            this.sqClass = original.sqClass;
            this.hash = hash;
            this._format = original._format;
            if (original.isFloat) {
                this.isFloat = original.isFloat;
                this.float = original.float;
            } else {
                if (original.pointers) this.pointers = original.pointers.slice(0);   // copy
                if (original.words) this.words = new Uint32Array(original.words);    // copy
                if (original.bytes) this.bytes = new Uint8Array(original.bytes);     // copy
            }
        },
        initFromImage: function(oop, cls, fmt, hsh) {
            // initial creation from Image, with unmapped data
            this.oop = oop;
            this.sqClass = cls;
            this._format = fmt;
            this.hash = hsh;
        },
        classNameFromImage: function(oopMap, rawBits) {
            var name = oopMap[rawBits[this.oop][Squeak.Class_name]];
            if (name && name._format >= 8 && name._format < 12) {
                var bits = rawBits[name.oop],
                    bytes = name.decodeBytes(bits.length, bits, 0, name._format & 3);
                return Squeak.bytesAsString(bytes);
            }
            return "Class";
        },
        renameFromImage: function(oopMap, rawBits, ccArray) {
            var classObj = this.sqClass < 32 ? oopMap[ccArray[this.sqClass-1]] : oopMap[this.sqClass];
            if (!classObj) return this;
            var instProto = classObj.instProto || classObj.classInstProto(classObj.classNameFromImage(oopMap, rawBits));
            if (!instProto) return this;
            var renamedObj = new instProto; // Squeak.Object
            renamedObj.oop = this.oop;
            renamedObj.sqClass = this.sqClass;
            renamedObj._format = this._format;
            renamedObj.hash = this.hash;
            return renamedObj;
        },
        installFromImage: function(oopMap, rawBits, ccArray, floatClass, littleEndian, nativeFloats) {
            //Install this object by decoding format, and rectifying pointers
            var ccInt = this.sqClass;
            // map compact classes
            if ((ccInt>0) && (ccInt<32))
                this.sqClass = oopMap[ccArray[ccInt-1]];
            else
                this.sqClass = oopMap[ccInt];
            var bits = rawBits[this.oop],
                nWords = bits.length;
            if (this._format < 5) {
                //Formats 0...4 -- Pointer fields
                if (nWords > 0) {
                    var oops = bits; // endian conversion was already done
                    this.pointers = this.decodePointers(nWords, oops, oopMap);
                }
            } else if (this._format >= 12) {
                //Formats 12-15 -- CompiledMethods both pointers and bits
                var methodHeader = this.decodeWords(1, bits, littleEndian)[0],
                    numLits = (methodHeader>>10) & 255,
                    oops = this.decodeWords(numLits+1, bits, littleEndian);
                this.pointers = this.decodePointers(numLits+1, oops, oopMap); //header+lits
                this.bytes = this.decodeBytes(nWords-(numLits+1), bits, numLits+1, this._format & 3);
            } else if (this._format >= 8) {
                //Formats 8..11 -- ByteArrays (and ByteStrings)
                if (nWords > 0)
                    this.bytes = this.decodeBytes(nWords, bits, 0, this._format & 3);
            } else if (this.sqClass == floatClass) {
                //These words are actually a Float
                this.isFloat = true;
                this.float = this.decodeFloat(bits, littleEndian, nativeFloats);
                if (this.float == 1.3797216632888e-310) {
                    if (Squeak.noFloatDecodeWorkaround) ; else {
                        this.constructor.prototype.decodeFloat = this.decodeFloatDeoptimized;
                        this.float = this.decodeFloat(bits, littleEndian, nativeFloats);
                        if (this.float == 1.3797216632888e-310)
                            throw Error("Cannot deoptimize decodeFloat");
                    }
                }
            } else {
                if (nWords > 0)
                    this.words = this.decodeWords(nWords, bits, littleEndian);
            }
            this.mark = false; // for GC
        },
        decodePointers: function(nWords, theBits, oopMap) {
            //Convert small ints and look up object pointers in oopMap
            var ptrs = new Array(nWords);
            for (var i = 0; i < nWords; i++) {
                var oop = theBits[i];
                if ((oop & 1) === 1) {          // SmallInteger
                    ptrs[i] = oop >> 1;
                } else {                        // Object
                    ptrs[i] = oopMap[oop] || 42424242;
                    // when loading a context from image segment, there is
                    // garbage beyond its stack pointer, resulting in the oop
                    // not being found in oopMap. We just fill in an arbitrary
                    // SmallInteger - it's never accessed anyway
                }
            }
            return ptrs;
        },
        decodeWords: function(nWords, theBits, littleEndian) {
            var data = new DataView(theBits.buffer, theBits.byteOffset),
                words = new Uint32Array(nWords);
            for (var i = 0; i < nWords; i++)
                words[i] = data.getUint32(i*4, littleEndian);
            return words;
        },
        decodeBytes: function (nWords, theBits, wordOffset, fmtLowBits) {
            // Adjust size for low bits and make a copy
            var nBytes = (nWords * 4) - fmtLowBits,
                wordsAsBytes = new Uint8Array(theBits.buffer, theBits.byteOffset + wordOffset * 4, nBytes),
                bytes = new Uint8Array(nBytes);
            bytes.set(wordsAsBytes);
            return bytes;
        },
        decodeFloat: function(theBits, littleEndian, nativeFloats) {
            var data = new DataView(theBits.buffer, theBits.byteOffset);
            // it's either big endian ...
            if (!littleEndian) return data.getFloat64(0, false);
            // or real little endian
            if (nativeFloats) return data.getFloat64(0, true);
            // or little endian, but with swapped words
            var buffer = new ArrayBuffer(8),
                swapped = new DataView(buffer);
            swapped.setUint32(0, data.getUint32(4));
            swapped.setUint32(4, data.getUint32(0));
            return swapped.getFloat64(0, true);
        },
        decodeFloatDeoptimized: function(theBits, littleEndian, nativeFloats) {
            var data = new DataView(theBits.buffer, theBits.byteOffset);
            // it's either big endian ...
            if (!littleEndian) return data.getFloat64(0, false);
            // or real little endian
            if (nativeFloats) return data.getFloat64(0, true);
            // or little endian, but with swapped words
            var buffer = new ArrayBuffer(8),
                swapped = new DataView(buffer);
            // wrap in function to defeat Safari's optimizer, which always
            // answers 1.3797216632888e-310 if called more than 25000 times
            (function() {
                swapped.setUint32(0, data.getUint32(4));
                swapped.setUint32(4, data.getUint32(0));
            })();
            return swapped.getFloat64(0, true);
        },
        fillArray: function(length, filler) {
            for (var array = [], i = 0; i < length; i++)
                array[i] = filler;
            return array;
        },
    },
    'testing', {
        isWords: function() {
            return this._format === 6;
        },
        isBytes: function() {
            var fmt = this._format;
            return fmt >= 8 && fmt <= 11;
        },
        isWordsOrBytes: function() {
            var fmt = this._format;
            return fmt == 6  || (fmt >= 8 && fmt <= 11);
        },
        isPointers: function() {
            return this._format <= 4;
        },
        isWeak: function() {
            return this._format === 4;
        },
        isMethod: function() {
            return this._format >= 12;
        },
        sameFormats: function(a, b) {
            return a < 8 ? a === b : (a & 0xC) === (b & 0xC);
        },
        sameFormatAs: function(obj) {
            return this.sameFormats(this._format, obj._format);
        },
    },
    'printing', {
        toString: function() {
            return this.sqInstName();
        },
        bytesAsString: function() {
            if (!this.bytes) return '';
            return Squeak.bytesAsString(this.bytes);
        },
        bytesAsNumberString: function(negative) {
            if (!this.bytes) return '';
            var hex = '0123456789ABCDEF',
                digits = [],
                value = 0;
            for (var i = this.bytes.length - 1; i >= 0; i--) {
                digits.push(hex[this.bytes[i] >> 4]);
                digits.push(hex[this.bytes[i] & 15]);
                value = value * 256 + this.bytes[i];
            }
            var sign = negative ? '-' : '',
                approx = value > 0x1FFFFFFFFFFFFF ? '≈' : '';
            return sign + '16r' + digits.join('') + ' (' + approx + sign + value + 'L)';
        },
        assnKeyAsString: function() {
            return this.pointers[Squeak.Assn_key].bytesAsString();
        },
        slotNameAt: function(index) {
            // one-based index
            var instSize = this.instSize();
            if (index <= instSize)
                return this.sqClass.allInstVarNames()[index - 1] || 'ivar' + (index - 1);
            else
                return (index - instSize).toString();
        },
        sqInstName: function() {
            if (this.isNil) return "nil";
            if (this.isTrue) return "true";
            if (this.isFalse) return "false";
            if (this.isFloat) {var str = this.float.toString(); if (!/\./.test(str)) str += '.0'; return str; }
            var className = this.sqClass.className();
            if (/ /.test(className))
                return 'the ' + className;
            switch (className) {
                case 'String':
                case 'ByteString': return "'" + this.bytesAsString() + "'";
                case 'Symbol':
                case 'ByteSymbol':  return "#" + this.bytesAsString();
                case 'Point': return this.pointers.join("@");
                case 'Rectangle': return this.pointers.join(" corner: ");
                case 'Association':
                case 'ReadOnlyVariableBinding': return this.pointers.join("->");
                case 'LargePositiveInteger': return this.bytesAsNumberString(false);
                case 'LargeNegativeInteger': return this.bytesAsNumberString(true);
                case 'Character': var unicode = this.pointers ? this.pointers[0] : this.hash; // Spur
                    return "$" + String.fromCharCode(unicode) + " (" + unicode.toString() + ")";
                case 'CompiledMethod': return this.methodAsString();
                case 'CompiledBlock': return "[] in " + this.blockOuterCode().sqInstName();
            }
            return  /^[aeiou]/i.test(className) ? 'an' + className : 'a' + className;
        },
    },
    'accessing', {
        pointersSize: function() {
            return this.pointers ? this.pointers.length : 0;
        },
        bytesSize: function() {
            return this.bytes ? this.bytes.length : 0;
        },
        wordsSize: function() {
            return this.isFloat ? 2 : this.words ? this.words.length : 0;
        },
        instSize: function() {//same as class.classInstSize, but faster from format
            var fmt = this._format;
            if (fmt > 4 || fmt === 2) return 0;      //indexable fields only
            if (fmt < 2) return this.pointersSize(); //fixed fields only
            return this.sqClass.classInstSize();
        },
        indexableSize: function(primHandler) {
            var fmt = this._format;
            if (fmt < 2) return -1; //not indexable
            if (fmt === 3 && primHandler.vm.isContext(this) && !primHandler.allowAccessBeyondSP)
                return this.pointers[Squeak.Context_stackPointer]; // no access beyond top of stacks
            if (fmt < 6) return this.pointersSize() - this.instSize(); // pointers
            if (fmt < 8) return this.wordsSize(); // words
            if (fmt < 12) return this.bytesSize(); // bytes
            return this.bytesSize() + (4 * this.pointersSize()); // methods
        },
        floatData: function() {
            var buffer = new ArrayBuffer(8);
            var data = new DataView(buffer);
            data.setFloat64(0, this.float, false);
            //1st word is data.getUint32(0, false);
            //2nd word is data.getUint32(4, false);
            return data;
        },
        wordsAsFloat32Array: function() {
            return this.float32Array
                || (this.words && (this.float32Array = new Float32Array(this.words.buffer)));
        },
        wordsAsFloat64Array: function() {
            return this.float64Array
                || (this.words && (this.float64Array = new Float64Array(this.words.buffer)));
        },
        wordsAsInt32Array: function() {
            return this.int32Array
                || (this.words && (this.int32Array = new Int32Array(this.words.buffer)));
        },
        wordsAsInt16Array: function() {
            return this.int16Array
                || (this.words && (this.int16Array = new Int16Array(this.words.buffer)));
        },
        wordsAsUint16Array: function() {
            return this.uint16Array
                || (this.words && (this.uint16Array = new Uint16Array(this.words.buffer)));
        },
        wordsAsUint8Array: function() {
            return this.uint8Array
                || (this.words && (this.uint8Array = new Uint8Array(this.words.buffer)));
        },
        wordsOrBytes: function() {
            if (this.words) return this.words;
            if (this.uint32Array) return this.uint32Array;
            if (!this.bytes) return null;
            return this.uint32Array = new Uint32Array(this.bytes.buffer, 0, this.bytes.length >>> 2);
        },
        setAddr: function(addr) {
            // Move this object to addr by setting its oop. Answer address after this object.
            // Used to assign an oop for the first time when tenuring this object during GC.
            // When compacting, the oop is adjusted directly, since header size does not change.
            var words = this.snapshotSize();
            this.oop = addr + words.header * 4;
            return addr + (words.header + words.body) * 4;
        },
        snapshotSize: function() {
            // words of extra object header and body this object would take up in image snapshot
            // body size includes one header word that is always present
            var nWords =
                this.isFloat ? 2 :
                this.words ? this.words.length :
                this.pointers ? this.pointers.length : 0;
            // methods have both pointers and bytes
            if (this.bytes) nWords += (this.bytes.length + 3) >>> 2;
            nWords++; // one header word always present
            var extraHeader = nWords > 63 ? 2 : this.sqClass.isCompact ? 0 : 1;
            return {header: extraHeader, body: nWords};
        },
        addr: function() { // start addr of this object in a snapshot
            return this.oop - this.snapshotSize().header * 4;
        },
        totalBytes: function() {
            // size in bytes this object would take up in image snapshot
            var words = this.snapshotSize();
            return (words.header + words.body) * 4;
        },
        writeTo: function(data, pos, image) {
            // Write 1 to 3 header words encoding type, class, and size, then instance data
            if (this.bytes) this._format |= -this.bytes.length & 3;
            var beforePos = pos,
                size = this.snapshotSize(),
                formatAndHash = ((this._format & 15) << 8) | ((this.hash & 4095) << 17);
            // write header words first
            switch (size.header) {
                case 2:
                    data.setUint32(pos, size.body << 2 | Squeak.HeaderTypeSizeAndClass); pos += 4;
                    data.setUint32(pos, this.sqClass.oop | Squeak.HeaderTypeSizeAndClass); pos += 4;
                    data.setUint32(pos, formatAndHash | Squeak.HeaderTypeSizeAndClass); pos += 4;
                    break;
                case 1:
                    data.setUint32(pos, this.sqClass.oop | Squeak.HeaderTypeClass); pos += 4;
                    data.setUint32(pos, formatAndHash | size.body << 2 | Squeak.HeaderTypeClass); pos += 4;
                    break;
                case 0:
                    var classIndex = image.compactClasses.indexOf(this.sqClass) + 1;
                    data.setUint32(pos, formatAndHash | classIndex << 12 | size.body << 2 | Squeak.HeaderTypeShort); pos += 4;
            }
            // now write body, if any
            if (this.isFloat) {
                data.setFloat64(pos, this.float); pos += 8;
            } else if (this.words) {
                for (var i = 0; i < this.words.length; i++) {
                    data.setUint32(pos, this.words[i]); pos += 4;
                }
            } else if (this.pointers) {
                for (var i = 0; i < this.pointers.length; i++) {
                    data.setUint32(pos, image.objectToOop(this.pointers[i])); pos += 4;
                }
            }
            // no "else" because CompiledMethods have both pointers and bytes
            if (this.bytes) {
                for (var i = 0; i < this.bytes.length; i++)
                    data.setUint8(pos++, this.bytes[i]);
                // skip to next word
                pos += -this.bytes.length & 3;
            }
            // done
            if (pos !== beforePos + this.totalBytes()) throw Error("written size does not match");
            return pos;
        },
    },
    'as class', {
        classInstFormat: function() {
            return (this.pointers[Squeak.Class_format] >> 7) & 0xF;
        },
        classInstSize: function() {
            // this is a class, answer number of named inst vars
            var spec = this.pointers[Squeak.Class_format];
            return ((spec >> 10) & 0xC0) + ((spec >> 1) & 0x3F) - 1;
        },
        classInstIsBytes: function() {
            var fmt = this.classInstFormat();
            return fmt >= 8 && fmt <= 11;
        },
        classInstIsPointers: function() {
            return this.classInstFormat() <= 4;
        },
        instVarNames: function() {
            // index changed from 4 to 3 in newer images
            for (var index = 3; index <= 4; index++) {
                var varNames = this.pointers[index].pointers;
                if (varNames && varNames.length && varNames[0].bytes) {
                    return varNames.map(function(each) {
                        return each.bytesAsString();
                    });
                }
            }
            return [];
        },
        allInstVarNames: function() {
            var superclass = this.superclass();
            if (superclass.isNil)
                return this.instVarNames();
            else
                return superclass.allInstVarNames().concat(this.instVarNames());
        },
        superclass: function() {
            return this.pointers[0];
        },
        className: function() {
            if (!this.pointers) return "_NOTACLASS_";
            for (var nameIdx = 6; nameIdx <= 7; nameIdx++) {
                var name = this.pointers[nameIdx];
                if (name && name.bytes) return name.bytesAsString();
            }
            // must be meta class
            for (var clsIndex = 5; clsIndex <= 6; clsIndex++) {
                var cls = this.pointers[clsIndex];
                if (cls && cls.pointers) {
                    for (var nameIdx = 6; nameIdx <= 7; nameIdx++) {
                        var name = cls.pointers[nameIdx];
                        if (name && name.bytes) return name.bytesAsString() + " class";
                    }
                }
            }
            return "_SOMECLASS_";
        },
        defaultInst: function() {
            return Squeak.Object;
        },
        classInstProto: function(className) {
            if (this.instProto) return this.instProto;
            var proto = this.defaultInst();  // in case below fails
            try {
                if (!className) className = this.className();
                var safeName = className.replace(/[^A-Za-z0-9]/g,'_');
                if (safeName === "UndefinedObject") safeName = "nil";
                else if (safeName === "True") safeName = "true_";
                else if (safeName === "False") safeName = "false_";
                else safeName = ((/^[AEIOU]/.test(safeName)) ? 'an' : 'a') + safeName;
                // fail okay if no eval()
                proto = new Function("return function " + safeName + "() {};")();
                proto.prototype = this.defaultInst().prototype;
            } catch(e) {}
            Object.defineProperty(this, 'instProto', { value: proto });
            return proto;
        },
    },
    'as method', {
        methodSignFlag: function() {
            return false;
        },
        methodNumLits: function() {
            return (this.pointers[0]>>9) & 0xFF;
        },
        methodNumArgs: function() {
            return (this.pointers[0]>>24) & 0xF;
        },
        methodPrimitiveIndex: function() {
            var primBits = this.pointers[0] & 0x300001FF;
            if (primBits > 0x1FF)
                return (primBits & 0x1FF) + (primBits >> 19);
            else
                return primBits;
        },
        methodClassForSuper: function() {//assn found in last literal
            var assn = this.pointers[this.methodNumLits()];
            return assn.pointers[Squeak.Assn_value];
        },
        methodNeedsLargeFrame: function() {
            return (this.pointers[0] & 0x20000) > 0;
        },
        methodAddPointers: function(headerAndLits) {
            this.pointers = headerAndLits;
        },
        methodTempCount: function() {
            return (this.pointers[0]>>18) & 63;
        },
        methodGetLiteral: function(zeroBasedIndex) {
            return this.pointers[1+zeroBasedIndex]; // step over header
        },
        methodGetSelector: function(zeroBasedIndex) {
            return this.pointers[1+zeroBasedIndex]; // step over header
        },
        methodAsString: function() {
          return 'aCompiledMethod';
        },
    },
    'as context', {
        contextHome: function() {
            return this.contextIsBlock() ? this.pointers[Squeak.BlockContext_home] : this;
        },
        contextIsBlock: function() {
            return typeof this.pointers[Squeak.BlockContext_argumentCount] === 'number';
        },
        contextMethod: function() {
            return this.contextHome().pointers[Squeak.Context_method];
        },
        contextSender: function() {
            return this.pointers[Squeak.Context_sender];
        },
        contextSizeWithStack: function(vm) {
            // Actual context size is inst vars + stack size. Slots beyond that may contain garbage.
            // If passing in a VM, and this is the activeContext, use the VM's current value.
            if (vm && vm.activeContext === this)
                return vm.sp + 1;
            // following is same as decodeSqueakSP() but works without vm ref
            var sp = this.pointers[Squeak.Context_stackPointer];
            return Squeak.Context_tempFrameStart + (typeof sp === "number" ? sp : 0);
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Squeak.Object.subclass('Squeak.ObjectSpur',
    'initialization',
    {
        initInstanceOf: function(aClass, indexableSize, hash, nilObj) {
            this.sqClass = aClass;
            this.hash = hash;
            var instSpec = aClass.pointers[Squeak.Class_format],
                instSize = instSpec & 0xFFFF,
                format = (instSpec>>16) & 0x1F;
            this._format = format;
            if (format < 12) {
                if (format < 10) {
                    if (instSize + indexableSize > 0)
                        this.pointers = this.fillArray(instSize + indexableSize, nilObj);
                } else // Words
                    if (indexableSize > 0)
                        if (aClass.isFloatClass) {
                            this.isFloat = true;
                            this.float = 0.0;
                        } else
                            this.words = new Uint32Array(indexableSize);
            } else // Bytes
                if (indexableSize > 0) {
                    // this._format |= -indexableSize & 3;       //deferred to writeTo()
                    this.bytes = new Uint8Array(indexableSize);  //Methods require further init of pointers
                }
    //      Definition of Spur's format code...
    //
    //     0 = 0 sized objects (UndefinedObject True False et al)
    //     1 = non-indexable objects with inst vars (Point et al)
    //     2 = indexable objects with no inst vars (Array et al)
    //     3 = indexable objects with inst vars (MethodContext AdditionalMethodState et al)
    //     4 = weak indexable objects with inst vars (WeakArray et al)
    //     5 = weak non-indexable objects with inst vars (ephemerons) (Ephemeron)
    //     6 = unused
    //     7 = immediates (SmallInteger, Character)
    //     8 = unused
    //     9 = 64-bit indexable
    // 10-11 = 32-bit indexable (Bitmap)          (plus one odd bit, unused in 32-bits)
    // 12-15 = 16-bit indexable                   (plus two odd bits, one unused in 32-bits)
    // 16-23 = 8-bit indexable                    (plus three odd bits, one unused in 32-bits)
    // 24-31 = compiled methods (CompiledMethod)  (plus three odd bits, one unused in 32-bits)
        },
        installFromImage: function(oopMap, rawBits, classTable, floatClass, littleEndian, getCharacter, is64Bit) {
            //Install this object by decoding format, and rectifying pointers
            var classID = this.sqClass;
            if (classID < 32) throw Error("Invalid class ID: " + classID);
            this.sqClass = classTable[classID];
            if (!this.sqClass) throw Error("Class ID not in class table: " + classID);
            var bits = rawBits[this.oop],
                nWords = bits.length;
            switch (this._format) {
                case 0: // zero sized object
                  // Pharo bug: Pharo 6.0 still has format 0 objects that actually do have inst vars
                  // https://pharo.fogbugz.com/f/cases/19010/ImmediateLayout-and-EphemeronLayout-have-wrong-object-format
                  // so we pretend these are regular objects and rely on nWords
                case 1: // only inst vars
                case 2: // only indexed vars
                case 3: // inst vars and indexed vars
                case 4: // only indexed vars (weak)
                case 5: // only inst vars (weak)
                    if (nWords > 0) {
                        var oops = bits; // endian conversion was already done
                        this.pointers = this.decodePointers(nWords, oops, oopMap, getCharacter, is64Bit);
                    }
                    break;
                case 11: // 32 bit array (odd length in 64 bits)
                    nWords--;
                    this._format = 10;
                case 10: // 32 bit array
                    if (this.sqClass === floatClass) {
                        //These words are actually a Float
                        this.isFloat = true;
                        this.float = this.decodeFloat(bits, littleEndian, true);
                        if (this.float == 1.3797216632888e-310) {
                            if (Squeak.noFloatDecodeWorkaround) ; else {
                                this.constructor.prototype.decodeFloat = this.decodeFloatDeoptimized;
                                this.float = this.decodeFloat(bits, littleEndian, true);
                                if (this.float == 1.3797216632888e-310)
                                    throw Error("Cannot deoptimize decodeFloat");
                            }
                        }
                    } else if (nWords > 0) {
                        this.words = this.decodeWords(nWords, bits, littleEndian);
                    }
                    break;
                case 12: // 16 bit array
                case 13: // 16 bit array (odd length)
                    throw Error("16 bit arrays not supported yet");
                case 20: // 8 bit array, length-4 (64 bit image)
                case 21: // ... length-5
                case 22: // ... length-6
                case 23: // ... length-7
                    nWords--;
                    this._format -= 4;
                    // fall through
                case 16: // 8 bit array
                case 17: // ... length-1
                case 18: // ... length-2
                case 19: // ... length-3
                    if (nWords > 0)
                        this.bytes = this.decodeBytes(nWords, bits, 0, this._format & 3);
                    break;
                case 28: // CompiledMethod, length-4 (64 bit image)
                case 29: // ... length-5
                case 30: // ... length-6
                case 31: // ... length-7
                    nWords--;
                    this._format -= 4;
                    // fall through
                case 24: // CompiledMethod
                case 25: // ... length-1
                case 26: // ... length-2
                case 27: // ... length-3
                    var rawHeader = this.decodeWords(1, bits, littleEndian)[0];
                    var intHeader = rawHeader >> (is64Bit ? 3 : 1);
                    var numLits = intHeader & 0x7FFF,
                        oops = is64Bit
                          ? this.decodeWords64(numLits+1, bits, littleEndian)
                          : this.decodeWords(numLits+1, bits, littleEndian),
                        ptrWords = is64Bit ? (numLits + 1) * 2 : numLits + 1;
                    this.pointers = this.decodePointers(numLits+1, oops, oopMap, getCharacter, is64Bit); //header+lits
                    this.bytes = this.decodeBytes(nWords-ptrWords, bits, ptrWords, this._format & 3);
                    if (is64Bit) this.pointers[0] = (bits[1] & 0x80000000) | intHeader; // fix header
                    break;
                default:
                    throw Error("Unknown object format: " + this._format);

            }
            this.mark = false; // for GC
        },
        decodeWords64: function(nWords, theBits, littleEndian) {
            // we assume littleEndian for now
            var words = new Array(nWords);
            for (var i = 0; i < nWords; i++) {
                var lo = theBits[i*2],
                    hi = theBits[i*2+1];
                words[i] = Squeak.word64FromUint32(hi, lo);
            }
            return words;
        },
        decodePointers: function(nWords, theBits, oopMap, getCharacter, is64Bit) {
            //Convert immediate objects and look up object pointers in oopMap
            var ptrs = new Array(nWords);
            for (var i = 0; i < nWords; i++) {
                var oop = theBits[i];
                // in 64 bits, oops > 53 bits are read as [hi, lo]
                if (typeof oop !== "number") {
                    if ((oop[1] & 7) === 4) {
                        ptrs[i] = this.decodeSmallFloat(oop[0], oop[1], is64Bit);
                    } else if ((oop[1] & 7) === 1) {
                        ptrs[i] = is64Bit.makeLargeFromSmall(oop[0], oop[1]);
                    } else if ((oop[1] & 7) === 2) {
                        throw Error("Large Immediate Characters not implemented yet");
                    } else {
                        throw Error("Large OOPs not implemented yet");
                    }
                } else if ((oop & 1) === 1) {          // SmallInteger
                    if (is64Bit) {
                        // if it fits in a 31 bit SmallInt ...
                        ptrs[i] = (oop >= 0 ? oop <= 0x1FFFFFFFF : oop >= -0x200000000)
                            ? oop / 4 >> 1  // ... then convert directly, otherwise make large
                            : is64Bit.makeLargeFromSmall((oop - (oop >>> 0)) / 0x100000000 >>> 0, oop >>> 0);
                    } else ptrs[i] = oop >> 1;
                } else if ((oop & 3) === 2) {   // Character
                    if (oop < 0 || oop > 0x1FFFFFFFF) throw Error("Large Immediate Characters not implemented yet");
                    ptrs[i] = getCharacter(oop >>> (is64Bit ? 3 : 2));
                } else if (is64Bit && (oop & 7) === 4) {   // SmallFloat
                    ptrs[i] = this.decodeSmallFloat((oop - (oop >>> 0)) / 0x100000000 >>> 0, oop >>> 0, is64Bit);
                } else {                        // Object
                    ptrs[i] = oopMap[oop] || 42424242;
                    // when loading a context from image segment, there is
                    // garbage beyond its stack pointer, resulting in the oop
                    // not being found in oopMap. We just fill in an arbitrary
                    // SmallInteger - it's never accessed anyway

                    // until 64 bit is working correctly, leave this here as a check ...
                    if (ptrs[i] === 42424242) debugger;
                }
            }
            return ptrs;
        },
        decodeSmallFloat: function(hi, lo, is64Bit) {
            // SmallFloats are stored with full 52 bit mantissa, but shortened exponent.
            // The lowest 3 bits are tags, the next is the sign bit
            var newHi = 0,
                newLo = 0,
                sign = (lo & 8) << (32-4),               // shift sign bit to msb
                isZero = (hi | (lo & 0xFFFFFFF0)) === 0; // ignore sign and tag bits
            if (isZero) {
                // zero is special - can be positive or negative
                newHi = sign;
            } else {
                // shift everything right by 4, fix exponent, add sign
                newHi = (hi >>> 4) + 0x38000000 | sign;
                newLo = (lo >>> 4) | (hi & 0xF) << (32-4);
                // 1023 is the bias of the 11-bit exponent in an IEEE 754 64-bit float,
                // and 127 is the bias of our 8-bit exponent. 1023-127 == 0x380
            }
            return is64Bit.makeFloat(new Uint32Array([newLo, newHi]));
        },
        overhead64: function(bits) {
            // the number of bytes this object is larger in 64 bits than in 32 bits
            // (due to 8-byte alignment even in 32 bits this only affects pointer objects)
            var overhead = 0;
            var words32 = 0;
            var words64 = 0;
            if (this._format <= 5) {
                // pointer objects
                overhead = bits.length & ~1; // each oop occupied 2 words instead of 1 ...
                // ... but odd lengths get padded so we subtract 1
                // words32 === words64 because same number of oops
            } else if (this._format >= 24) {
                // compiled methods
                var numLits = (bits[0] >> 3) & 0x7FFF; // assumes 64 bit little endian
                var overhead = numLits + 1;  // each oop occupied 2 words instead of 1 ...
                var oddOops = (overhead & 1) === 1;
                var oddBytes = this._format >= 28;
                // ... odd-word lengths would get padded so we subtract 1,
                // but if there is also odd-word bytecodes it cancels out so we save 1 word instead
                if (oddOops) overhead += oddBytes ? +1 : -1;
                words64 = bits.length / 2;
                words32 = bits.length - overhead;
            } else {
                // non-pointer objects have no oop overhead
                words32 = bits.length;
                words64 = words32 / 2;
            }
            // we need an extra header in 32 bits if we now use more words than before
            return {
                bytes: overhead * 4,
                sizeHeader: words32 >= 255 && words64 < 255,
            }
        },
        initInstanceOfChar: function(charClass, unicode) {
            this.oop = (unicode << 2) | 2;
            this.sqClass = charClass;
            this.hash = unicode;
            this._format = 7;
            this.mark = true;   // stays always marked so not traced by GC
        },
        initInstanceOfFloat: function(floatClass, bits) {
            this.sqClass = floatClass;
            this.hash = 0;
            this._format = 10;
            this.isFloat = true;
            this.float = this.decodeFloat(bits, true, true);
        },
        initInstanceOfLargeInt: function(largeIntClass, size) {
            this.sqClass = largeIntClass;
            this.hash = 0;
            this._format = 16;
            // this._format |= -indexableSize & 3;       //deferred to writeTo()
            this.bytes = new Uint8Array(size);
        },
        classNameFromImage: function(oopMap, rawBits) {
            var name = oopMap[rawBits[this.oop][Squeak.Class_name]];
            if (name && name._format >= 16 && name._format < 24) {
                var bits = rawBits[name.oop],
                    bytes = name.decodeBytes(bits.length, bits, 0, name._format & 7);
                return Squeak.bytesAsString(bytes);
            }
            return "Class";
        },
        renameFromImage: function(oopMap, rawBits, classTable) {
            var classObj = classTable[this.sqClass];
            if (!classObj) return this;
            var instProto = classObj.instProto || classObj.classInstProto(classObj.classNameFromImage(oopMap, rawBits));
            if (!instProto) return this;
            var renamedObj = new instProto; // Squeak.SpurObject
            renamedObj.oop = this.oop;
            renamedObj.sqClass = this.sqClass;
            renamedObj._format = this._format;
            renamedObj.hash = this.hash;
            return renamedObj;
        },
    },
    'accessing', {
        instSize: function() {//same as class.classInstSize, but faster from format
            if (this._format < 2) return this.pointersSize(); //fixed fields only
            return this.sqClass.classInstSize();
        },
        indexableSize: function(primHandler) {
            var fmt = this._format;
            if (fmt < 2) return -1; //not indexable
            if (fmt === 3 && primHandler.vm.isContext(this))
                return this.pointers[Squeak.Context_stackPointer]; // no access beyond top of stacks
            if (fmt < 6) return this.pointersSize() - this.instSize(); // pointers
            if (fmt < 12) return this.wordsSize(); // words
            if (fmt < 16) return this.shortsSize(); // shorts
            if (fmt < 24) return this.bytesSize(); // bytes
            return 4 * this.pointersSize() + this.bytesSize(); // methods
        },
        snapshotSize: function() {
            // words of extra object header and body this object would take up in image snapshot
            // body size includes header size that is always present
            var nWords =
                this.isFloat ? 2 :
                this.words ? this.words.length :
                this.pointers ? this.pointers.length : 0;
            // methods have both pointers and bytes
            if (this.bytes) nWords += (this.bytes.length + 3) >>> 2;
            var extraHeader = nWords >= 255 ? 2 : 0;
            nWords += nWords & 1; // align to 8 bytes
            nWords += 2; // one 64 bit header always present
            if (nWords < 4) nWords = 4; // minimum object size
            return {header: extraHeader, body: nWords};
        },
        writeTo: function(data, pos, littleEndian, objToOop) {
            var nWords =
                this.isFloat ? 2 :
                this.words ? this.words.length :
                this.pointers ? this.pointers.length : 0;
            if (this.bytes) {
                nWords += (this.bytes.length + 3) >>> 2;
                this._format |= -this.bytes.length & 3;
            }
            var beforePos = pos,
                formatAndClass = (this._format << 24) | (this.sqClass.hash & 0x003FFFFF),
                sizeAndHash = (nWords << 24) | (this.hash & 0x003FFFFF);
            // write extra header if needed
            if (nWords >= 255) {
                data.setUint32(pos, nWords, littleEndian); pos += 4;
                sizeAndHash = (255 << 24) | (this.hash & 0x003FFFFF);
                data.setUint32(pos, sizeAndHash, littleEndian); pos += 4;
            }
            // write regular header
            data.setUint32(pos, formatAndClass, littleEndian); pos += 4;
            data.setUint32(pos, sizeAndHash, littleEndian); pos += 4;
            // now write body, if any
            if (this.isFloat) {
                data.setFloat64(pos, this.float, littleEndian); pos += 8;
            } else if (this.words) {
                for (var i = 0; i < this.words.length; i++) {
                    data.setUint32(pos, this.words[i], littleEndian); pos += 4;
                }
            } else if (this.pointers) {
                var startIndex = 0;
                if (this._format >= 24) {
                    // preserve signFlag in method header
                    var mask = this.methodSignFlag() ? 0x80000000 : 0;
                    var taggedHeader = this.pointers[0] << 1 | 1 | mask;
                    data.setUint32(pos, taggedHeader, littleEndian); pos += 4;
                    startIndex = 1;
                }
                for (var i = startIndex; i < this.pointers.length; i++) {
                    data.setUint32(pos, objToOop(this.pointers[i]), littleEndian); pos += 4;
                }
            }
            // no "else" because CompiledMethods have both pointers and bytes
            if (this.bytes) {
                for (var i = 0; i < this.bytes.length; i++)
                    data.setUint8(pos++, this.bytes[i]);
                // skip to next word
                pos += -this.bytes.length & 3;
            }
            // minimum object size is 16, align to 8 bytes
            if (nWords === 0) pos += 8;
            else pos += (nWords & 1) * 4;
            // done
            if (pos !== beforePos + this.totalBytes()) throw Error("written size does not match");
            return pos;
        },
    },
    'testing', {
        isBytes: function() {
            var fmt = this._format;
            return fmt >= 16 && fmt <= 23;
        },
        isPointers: function() {
            return this._format <= 6;
        },
        isWords: function() {
            return this._format === 10;
        },
        isWordsOrBytes: function() {
            var fmt = this._format;
            return fmt === 10 || (fmt >= 16 && fmt <= 23);
        },
        isWeak: function() {
            return this._format === 4;
        },
        isMethod: function() {
            return this._format >= 24;
        },
        sameFormats: function(a, b) {
            return a < 16 ? a === b : (a & 0xF8) === (b & 0xF8);
        },
    },
    'as class', {
        defaultInst: function() {
            return Squeak.ObjectSpur;
        },
        classInstFormat: function() {
            return (this.pointers[Squeak.Class_format] >> 16) & 0x1F;
        },
        classInstSize: function() {
            // this is a class, answer number of named inst vars
            return this.pointers[Squeak.Class_format] & 0xFFFF;
        },
        classInstIsBytes: function() {
            var fmt = this.classInstFormat();
            return fmt >= 16 && fmt <= 23;
        },
        classInstIsPointers: function() {
            return this.classInstFormat() <= 6;
        },
        classByteSizeOfInstance: function(nElements) {
            var format = this.classInstFormat(),
                nWords = this.classInstSize();
            if (format < 9) nWords += nElements;                        // 32 bit
            else if (format >= 16) nWords += (nElements + 3) / 4 | 0;   //  8 bit
            else if (format >= 12) nWords += (nElements + 1) / 2 | 0;   // 16 bit
            else if (format >= 10) nWords += nElements;                 // 32 bit
            else nWords += nElements * 2;                               // 64 bit
            nWords += nWords & 1;                                       // align to 64 bits
            nWords += nWords >= 255 ? 4 : 2;                            // header words
            if (nWords < 4) nWords = 4;                                 // minimum object size
            return nWords * 4;
        },
    },
    'as compiled block', {
        blockOuterCode: function() {
            return this.pointers[this.pointers.length - 1];
        },
    },
    'as method', {
        methodSignFlag: function() {
            return this.pointers[0] < 0;
        },
        methodNumLits: function() {
            return this.pointers[0] & 0x7FFF;
        },
        methodPrimitiveIndex: function() {
            if ((this.pointers[0] & 0x10000) === 0) return 0;
            return this.bytes[1] + 256 * this.bytes[2];
        },
        methodAsString: function() {
            var cls = this.pointers[this.pointers.length - 1].pointers[Squeak.ClassBinding_value];
            var selector = this.pointers[this.pointers.length - 2];
            if (selector.pointers) selector = selector.pointers[Squeak.AdditionalMethodState_selector];
            return cls.className() + ">>" + selector.bytesAsString();
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.Image',
    'about', {
        about: function() {
        /*
        Object Format
        =============
        Each Squeak object is a Squeak.Object instance, only SmallIntegers are JS numbers.
        Instance variables/fields reference other objects directly via the "pointers" property.
        A Spur image uses Squeak.ObjectSpur instances instead. Characters are not immediate,
        but made identical using a character table. They are created with their mark bit set to
        true, so are ignored by the GC.
        {
            sqClass: reference to class object
            format: format integer as in Squeak oop header
            hash: identity hash integer
            pointers: (optional) Array referencing inst vars + indexable fields
            words: (optional) Array of numbers (words)
            bytes: (optional) Array of numbers (bytes)
            float: (optional) float value if this is a Float object
            isNil: (optional) true if this is the nil object
            isTrue: (optional) true if this is the true object
            isFalse: (optional) true if this is the false object
            isFloat: (optional) true if this is a Float object
            isFloatClass: (optional) true if this is the Float class
            isCompact: (optional) true if this is a compact class
            oop: identifies this object in a snapshot (assigned on GC, new space object oops are negative)
            mark: boolean (used only during GC, otherwise false)
            dirty: boolean (true when an object may have a ref to a new object, set on every write, reset on GC)
            nextObject: linked list of objects in old space and young space (newly created objects do not have this yet)
        }

        Object Memory
        =============
        Objects in old space are a linked list (firstOldObject). When loading an image, all objects are old.
        Objects are tenured to old space during a full GC.
        New objects are only referenced by other objects' pointers, and thus can be garbage-collected
        at any time by the Javascript GC.
        A partial GC links new objects to support enumeration of new space.

        Weak references are finalized by a full GC. A partial GC only finalizes young weak references.

        */
        }
    },
    'initializing', {
        initialize: function(name) {
            this.totalMemory = 100000000;
            this.name = name;
            this.gcCount = 0;
            this.gcMilliseconds = 0;
            this.pgcCount = 0;
            this.pgcMilliseconds = 0;
            this.gcTenured = 0;
            this.allocationCount = 0;
            this.oldSpaceCount = 0;
            this.youngSpaceCount = 0;
            this.newSpaceCount = 0;
            this.hasNewInstances = {};
        },
        readFromBuffer: function(arraybuffer, thenDo, progressDo) {
            console.log('squeak: reading ' + this.name + ' (' + arraybuffer.byteLength + ' bytes)');
            this.startupTime = Date.now();
            var data = new DataView(arraybuffer),
                littleEndian = false,
                pos = 0;
            var readWord32 = function() {
                var int = data.getUint32(pos, littleEndian);
                pos += 4;
                return int;
            };
            var readWord64 = function() {
                // we assume littleEndian for now
                var lo = data.getUint32(pos, true),
                    hi = data.getUint32(pos+4, true);
                pos += 8;
                return Squeak.word64FromUint32(hi, lo);
            };
            var readWord = readWord32;
            var wordSize = 4;
            var readBits = function(nWords, isPointers) {
                if (isPointers) { // do endian conversion
                    var oops = [];
                    while (oops.length < nWords)
                        oops.push(readWord());
                    return oops;
                } else { // words (no endian conversion yet)
                    var bits = new Uint32Array(arraybuffer, pos, nWords * wordSize / 4);
                    pos += nWords * wordSize;
                    return bits;
                }
            };
            // read version and determine endianness
            var versions = [6501, 6502, 6504, 6505, 6521, 68000, 68002, 68003, 68021],
                version = 0,
                fileHeaderSize = 0;
            while (true) {  // try all four endianness + header combos
                littleEndian = !littleEndian;
                pos = fileHeaderSize;
                version = readWord();
                if (versions.indexOf(version) >= 0) break;
                if (!littleEndian) fileHeaderSize += 512;
                if (fileHeaderSize > 512) throw Error("bad image version");
            }        this.version = version;
            var nativeFloats = [6505, 6521, 68003, 68021].indexOf(version) >= 0;
            this.hasClosures = [6504, 6505, 6521, 68002, 68003, 68021].indexOf(version) >= 0;
            this.isSpur = [6521, 68021].indexOf(version) >= 0;
            var is64Bit = version >= 68000;
            if (is64Bit && !this.isSpur) throw Error("64 bit non-spur images not supported yet");
            if (is64Bit)  { readWord = readWord64; wordSize = 8; }
            // parse image header
            var imageHeaderSize = readWord32(); // always 32 bits
            var objectMemorySize = readWord(); //first unused location in heap
            var oldBaseAddr = readWord(); //object memory base address of image
            var specialObjectsOopInt = readWord(); //oop of array of special oops
            this.savedHeaderWords = [];
            for (var i = 0; i < 7; i++) {
                this.savedHeaderWords.push(readWord32());
                if (is64Bit && i < 3) readWord32(); // skip half
            }
            var firstSegSize = readWord();
            var prevObj;
            var oopMap = {};
            var rawBits = {};
            var headerSize = fileHeaderSize + imageHeaderSize;
            pos = headerSize;
            if (!this.isSpur) {
                // read traditional object memory
                while (pos < headerSize + objectMemorySize) {
                    var nWords = 0;
                    var classInt = 0;
                    var header = readWord();
                    switch (header & Squeak.HeaderTypeMask) {
                        case Squeak.HeaderTypeSizeAndClass:
                            nWords = header >>> 2;
                            classInt = readWord();
                            header = readWord();
                            break;
                        case Squeak.HeaderTypeClass:
                            classInt = header - Squeak.HeaderTypeClass;
                            header = readWord();
                            nWords = (header >>> 2) & 63;
                            break;
                        case Squeak.HeaderTypeShort:
                            nWords = (header >>> 2) & 63;
                            classInt = (header >>> 12) & 31; //compact class index
                            //Note classInt<32 implies compact class index
                            break;
                        case Squeak.HeaderTypeFree:
                            throw Error("Unexpected free block");
                    }
                    nWords--;  //length includes base header which we have already read
                    var oop = pos - 4 - headerSize, //0-rel byte oop of this object (base header)
                        format = (header>>>8) & 15,
                        hash = (header>>>17) & 4095,
                        bits = readBits(nWords, format < 5);
                    var object = new Squeak.Object();
                    object.initFromImage(oop, classInt, format, hash);
                    if (classInt < 32) object.hash |= 0x10000000;    // see fixCompactOops()
                    if (prevObj) prevObj.nextObject = object;
                    this.oldSpaceCount++;
                    prevObj = object;
                    //oopMap is from old oops to actual objects
                    oopMap[oldBaseAddr + oop] = object;
                    //rawBits holds raw content bits for objects
                    rawBits[oop] = bits;
                }
                this.firstOldObject = oopMap[oldBaseAddr+4];
                this.lastOldObject = object;
                this.lastOldObject.nextObject = null; // Add next object pointer as indicator this is in fact an old object
                this.oldSpaceBytes = objectMemorySize;
            } else {
                // Read all Spur object memory segments
                this.oldSpaceBytes = firstSegSize - 16;
                var segmentEnd = pos + firstSegSize,
                    addressOffset = 0,
                    classPages = null,
                    skippedBytes = 0,
                    oopAdjust = {};
                while (pos < segmentEnd) {
                    while (pos < segmentEnd - 16) {
                        // read objects in segment
                        var objPos = pos,
                            formatAndClass = readWord32(),
                            sizeAndHash = readWord32(),
                            size = sizeAndHash >>> 24;
                        if (size === 255) { // this was the extended size header, read actual header
                            size = formatAndClass;
                            // In 64 bit images the size can actually be 56 bits. LOL. Nope.
                            // if (is64Bit) size += (sizeAndHash & 0x00FFFFFF) * 0x100000000;
                            formatAndClass = readWord32();
                            sizeAndHash = readWord32();
                        }
                        var oop = addressOffset + pos - 8 - headerSize,
                            format = (formatAndClass >>> 24) & 0x1F,
                            classID = formatAndClass & 0x003FFFFF,
                            hash = sizeAndHash & 0x003FFFFF;
                        var bits = readBits(size, format < 10 && classID > 0);
                        // align on 8 bytes, min size 16 bytes
                        pos += is64Bit
                          ? (size < 1 ? 1 - size : 0) * 8
                          : (size < 2 ? 2 - size : size & 1) * 4;
                        // low class ids are internal to Spur
                        if (classID >= 32) {
                            var object = new Squeak.ObjectSpur();
                            object.initFromImage(oop, classID, format, hash);
                            if (prevObj) prevObj.nextObject = object;
                            this.oldSpaceCount++;
                            prevObj = object;
                            //oopMap is from old oops to actual objects
                            oopMap[oldBaseAddr + oop] = object;
                            //rawBits holds raw content bits for objects
                            rawBits[oop] = bits;
                            oopAdjust[oop] = skippedBytes;
                            // account for size difference of 32 vs 64 bit oops
                            if (is64Bit) {
                                var overhead = object.overhead64(bits);
                                skippedBytes += overhead.bytes;
                                // OTOH, in 32 bits we need the extra size header sooner
                                // so in some cases 64 bits has 2 words less overhead
                                if (overhead.sizeHeader) {
                                    oopAdjust[oop] -= 8;
                                    skippedBytes -= 8;
                                }
                            }
                        } else {
                            skippedBytes += pos - objPos;
                            if (classID === 16 && !classPages) classPages = bits;
                            if (classID) oopMap[oldBaseAddr + oop] = bits;  // used in spurClassTable()
                        }
                    }
                    if (pos !== segmentEnd - 16) throw Error("invalid segment");
                    // last 16 bytes in segment is a bridge object
                    var deltaWords = readWord32(),
                        deltaWordsHi = readWord32(),
                        segmentBytes = readWord32(),
                        segmentBytesHi = readWord32();
                    //  if segmentBytes is zero, the end of the image has been reached
                    if (segmentBytes !== 0) {
                        var deltaBytes = deltaWordsHi & 0xFF000000 ? (deltaWords & 0x00FFFFFF) * 4 : 0;
                        segmentEnd += segmentBytes;
                        addressOffset += deltaBytes;
                        skippedBytes += 16 + deltaBytes;
                        this.oldSpaceBytes += deltaBytes + segmentBytes;
                    }
                }
                this.oldSpaceBytes -= skippedBytes;
                this.firstOldObject = oopMap[oldBaseAddr];
                this.lastOldObject = object;
                this.lastOldObject.nextObject = null; // Add next object pointer as indicator this is in fact an old object
            }

            {
                // For debugging: re-create all objects from named prototypes
                var _splObs = oopMap[specialObjectsOopInt],
                    cc = this.isSpur ? this.spurClassTable(oopMap, rawBits, classPages, _splObs)
                        : rawBits[oopMap[rawBits[_splObs.oop][Squeak.splOb_CompactClasses]].oop];
                var renamedObj = null;
                object = this.firstOldObject;
                prevObj = null;
                while (object) {
                    prevObj = renamedObj;
                    renamedObj = object.renameFromImage(oopMap, rawBits, cc);
                    if (prevObj) prevObj.nextObject = renamedObj;
                    else this.firstOldObject = renamedObj;
                    oopMap[oldBaseAddr + object.oop] = renamedObj;
                    object = object.nextObject;
                }
                this.lastOldObject = renamedObj;
                this.lastOldObject.nextObject = null; // Add next object pointer as indicator this is in fact an old object
            }

            // properly link objects by mapping via oopMap
            var splObs         = oopMap[specialObjectsOopInt];
            var compactClasses = rawBits[oopMap[rawBits[splObs.oop][Squeak.splOb_CompactClasses]].oop];
            var floatClass     = oopMap[rawBits[splObs.oop][Squeak.splOb_ClassFloat]];
            // Spur needs different arguments for installFromImage()
            if (this.isSpur) {
                this.initImmediateClasses(oopMap, rawBits, splObs);
                compactClasses = this.spurClassTable(oopMap, rawBits, classPages, splObs);
                nativeFloats = this.getCharacter.bind(this);
                this.initSpurOverrides();
            }
            var obj = this.firstOldObject,
                done = 0;
            var mapSomeObjects = function() {
                if (obj) {
                    var stop = done + (this.oldSpaceCount / 20 | 0);    // do it in 20 chunks
                    while (obj && done < stop) {
                        obj.installFromImage(oopMap, rawBits, compactClasses, floatClass, littleEndian, nativeFloats, is64Bit && {
                                makeFloat: function makeFloat(bits) {
                                    return this.instantiateFloat(bits);
                                }.bind(this),
                                makeLargeFromSmall: function makeLargeFromSmall(hi, lo) {
                                    return this.instantiateLargeFromSmall(hi, lo);
                                }.bind(this),
                            });
                        obj = obj.nextObject;
                        done++;
                    }
                    if (progressDo) progressDo(done / this.oldSpaceCount);
                    return true;    // do more
                } else { // done
                    this.specialObjectsArray = splObs;
                    this.decorateKnownObjects();
                    if (this.isSpur) {
                        this.fixSkippedOops(oopAdjust);
                        if (is64Bit) this.fixPCs();
                        this.ensureFullBlockClosureClass(this.specialObjectsArray, compactClasses);
                    } else {
                        this.fixCompiledMethods();
                        this.fixCompactOops();
                    }
                    return false;   // don't do more
                }
            }.bind(this);
            function mapSomeObjectsAsync() {
                if (mapSomeObjects()) {
                    self.setTimeout(mapSomeObjectsAsync, 0);
                } else {
                    if (thenDo) thenDo();
                }
            }        if (!progressDo) {
                while (mapSomeObjects()) {}            if (thenDo) thenDo();
            } else {
                self.setTimeout(mapSomeObjectsAsync, 0);
            }
        },
        decorateKnownObjects: function() {
            var splObjs = this.specialObjectsArray.pointers;
            splObjs[Squeak.splOb_NilObject].isNil = true;
            splObjs[Squeak.splOb_TrueObject].isTrue = true;
            splObjs[Squeak.splOb_FalseObject].isFalse = true;
            splObjs[Squeak.splOb_ClassFloat].isFloatClass = true;
            if (!this.isSpur) {
                this.compactClasses = this.specialObjectsArray.pointers[Squeak.splOb_CompactClasses].pointers;
                for (var i = 0; i < this.compactClasses.length; i++)
                    if (!this.compactClasses[i].isNil)
                        this.compactClasses[i].isCompact = true;
            }
            if (!Number.prototype.sqInstName)
                Object.defineProperty(Number.prototype, 'sqInstName', {
                    enumerable: false,
                    value: function() { return this.toString() }
                });
        },
        fixCompactOops: function() {
            // instances of compact classes might have been saved with a non-compact header
            // fix their oops here so validation succeeds later
            if (this.isSpur) return;
            var obj = this.firstOldObject,
                adjust = 0;
            while (obj) {
                var hadCompactHeader = obj.hash > 0x0FFFFFFF,
                    mightBeCompact = !!obj.sqClass.isCompact;
                if (hadCompactHeader !== mightBeCompact) {
                    var isCompact = obj.snapshotSize().header === 0;
                    if (hadCompactHeader !== isCompact) {
                        adjust += isCompact ? -4 : 4;
                    }
                }
                obj.hash &= 0x0FFFFFFF;
                obj.oop += adjust;
                obj = obj.nextObject;
            }
            this.oldSpaceBytes += adjust;
        },
        fixCompiledMethods: function() {
            // in the 6501 pre-release image, some CompiledMethods
            // do not have the proper class
            if (this.version >= 6502) return;
            var obj = this.firstOldObject,
                compiledMethodClass = this.specialObjectsArray.pointers[Squeak.splOb_ClassCompiledMethod];
            while (obj) {
                if (obj.isMethod()) obj.sqClass = compiledMethodClass;
                obj = obj.nextObject;
            }
        },
        fixSkippedOops: function(oopAdjust) {
            // reading Spur skips some internal objects
            // we adjust the oops of following objects here
            // this is like the compaction phase of our GC
            var obj = this.firstOldObject;
            while (obj) {
                obj.oop -= oopAdjust[obj.oop];
                obj = obj.nextObject;
            }
            // do a sanity check
            obj = this.lastOldObject;
            if (obj.addr() + obj.totalBytes() !== this.oldSpaceBytes)
                throw Error("image size doesn't match object sizes")
        },
        fixPCs: function() {
            // In 64 bits literals take up twice as much space
            // The pc starts after the last literal. Fix it.
            var clsMethodContext = this.specialObjectsArray.pointers[Squeak.splOb_ClassMethodContext],
                pc = Squeak.Context_instructionPointer,
                method = Squeak.Context_method,
                clsBlockClosure = this.specialObjectsArray.pointers[Squeak.splOb_ClassBlockClosure],
                startpc = Squeak.Closure_startpc,
                outerContext = Squeak.Closure_outerContext,
                obj = this.firstOldObject;
            while (obj) {
                if (obj.sqClass === clsMethodContext) {
                    obj.pointers[pc] -= obj.pointers[method].pointers.length * 4;
                } else if (obj.sqClass === clsBlockClosure) {
                    obj.pointers[startpc] -= obj.pointers[outerContext].pointers[method].pointers.length * 4;
                }
                obj = obj.nextObject;
            }
        },
        ensureFullBlockClosureClass: function(splObs, compactClasses) {
            // Read FullBlockClosure class from compactClasses if not yet present in specialObjectsArray.
            if (splObs.pointers[Squeak.splOb_ClassFullBlockClosure].isNil && compactClasses[38]) {
                splObs.pointers[Squeak.splOb_ClassFullBlockClosure] = compactClasses[38];
            }
        },
    },
    'garbage collection - full', {
        fullGC: function(reason) {
            // Collect garbage and return first tenured object (to support object enumeration)
            // Old space is a linked list of objects - each object has an "nextObject" reference.
            // New space objects do not have that pointer, they are garbage-collected by JavaScript.
            // But they have an allocation id so the survivors can be ordered on tenure.
            // The "nextObject" references are created by collecting all new objects,
            // sorting them by id, and then linking them into old space.
            this.vm.addMessage("fullGC: " + reason);
            var start = Date.now();
            var newObjects = this.markReachableObjects();
            this.removeUnmarkedOldObjects();
            this.appendToOldObjects(newObjects);
            this.finalizeWeakReferences();
            this.allocationCount += this.newSpaceCount;
            this.newSpaceCount = 0;
            this.youngSpaceCount = 0;
            this.hasNewInstances = {};
            this.gcCount++;
            this.gcMilliseconds += Date.now() - start;
            console.log("Full GC (" + reason + "): " + (Date.now() - start) + " ms");
            return newObjects.length > 0 ? newObjects[0] : null;
        },
        gcRoots: function() {
            // the roots of the system
            this.vm.storeContextRegisters();        // update active context
            return [this.specialObjectsArray, this.vm.activeContext];
        },
        markReachableObjects: function() {
            // FullGC: Visit all reachable objects and mark them.
            // Return surviving new objects
            // Contexts are handled specially: they have garbage beyond the stack pointer
            // which must not be traced, and is cleared out here
            // In weak objects, only the inst vars are traced
            var todo = this.gcRoots();
            var newObjects = [];
            this.weakObjects = [];
            while (todo.length > 0) {
                var object = todo.pop();
                if (object.mark) continue;    // objects are added to todo more than once
                if (object.oop < 0)           // it's a new object
                    newObjects.push(object);
                object.mark = true;           // mark it
                if (!object.sqClass.mark)     // trace class if not marked
                    todo.push(object.sqClass);
                var body = object.pointers;
                if (body) {                   // trace all unmarked pointers
                    var n = body.length;
                    if (object.isWeak()) {
                        n = object.sqClass.classInstSize();     // do not trace weak fields
                        this.weakObjects.push(object);
                    }
                    if (this.vm.isContext(object)) {            // contexts have garbage beyond SP
                        n = object.contextSizeWithStack();
                        for (var i = n; i < body.length; i++)   // clean up that garbage
                            body[i] = this.vm.nilObj;
                    }
                    for (var i = 0; i < n; i++)
                        if (typeof body[i] === "object" && !body[i].mark)      // except immediates
                            todo.push(body[i]);
                    // Note: "immediate" character objects in Spur always stay marked
                }
            }
            // pre-spur sort by oop to preserve creation order
            return this.isSpur ? newObjects : newObjects.sort(function(a,b){return b.oop - a.oop});
        },
        removeUnmarkedOldObjects: function() {
            // FullGC: Unlink unmarked old objects from the nextObject linked list
            // Reset marks of remaining objects, and adjust their oops
            // Set this.lastOldObject to last old object
            var removedCount = 0,
                removedBytes = 0,
                obj = this.firstOldObject;
            obj.mark = false; // we know the first object (nil) was marked
            while (true) {
                var next = obj.nextObject;
                if (!next) {// we're done
                    this.lastOldObject = obj;
                    this.lastOldObject.nextObject = null; // Add next object pointer as indicator this is in fact an old object
                    this.oldSpaceBytes -= removedBytes;
                    this.oldSpaceCount -= removedCount;
                    return;
                }
                // reset partial GC flag
                if (next.dirty) next.dirty = false;
                // if marked, continue with next object
                if (next.mark) {
                    obj = next;
                    obj.mark = false;           // unmark for next GC
                    obj.oop -= removedBytes;    // compact oops
                } else { // otherwise, remove it
                    var corpse = next;
                    obj.nextObject = corpse.nextObject;     // drop from old-space list
                    corpse.oop = -(++this.newSpaceCount);   // move to new-space for finalizing
                    removedBytes += corpse.totalBytes();
                    removedCount++;
                    //console.log("removing " + removedCount + " " + removedBytes + " " + corpse.totalBytes() + " " + corpse.toString())
                }
            }
        },
        appendToOldObjects: function(newObjects) {
            // FullGC: append new objects to linked list of old objects
            // and unmark them
            var oldObj = this.lastOldObject;
            //var oldBytes = this.oldSpaceBytes;
            for (var i = 0; i < newObjects.length; i++) {
                var newObj = newObjects[i];
                newObj.mark = false;
                this.oldSpaceBytes = newObj.setAddr(this.oldSpaceBytes);     // add at end of memory
                oldObj.nextObject = newObj;
                oldObj = newObj;
                //console.log("tenuring " + (i+1) + " " + (this.oldSpaceBytes - oldBytes) + " " + newObj.totalBytes() + " " + newObj.toString());
            }
            oldObj.nextObject = null;   // might have been in young space
            this.lastOldObject = oldObj;
            this.lastOldObject.nextObject = null; // Add next object pointer as indicator this is in fact an old object
            this.oldSpaceCount += newObjects.length;
            this.gcTenured += newObjects.length;
        },
        tenureIfYoung: function(object) {
            if (object.oop < 0) {
                this.appendToOldObjects([object]);
            }
        },
        finalizeWeakReferences: function() {
            // nil out all weak fields that did not survive GC
            var weakObjects = this.weakObjects;
            this.weakObjects = null;
            for (var o = 0; o < weakObjects.length; o++) {
                var weakObj = weakObjects[o],
                    pointers = weakObj.pointers,
                    firstWeak = weakObj.sqClass.classInstSize(),
                    finalized = false;
                for (var i = firstWeak; i < pointers.length; i++) {
                    if (pointers[i].oop < 0) {    // ref is not in old-space
                        pointers[i] = this.vm.nilObj;
                        finalized = true;
                    }
                }
                if (finalized) {
                    this.vm.pendingFinalizationSignals++;
                    if (firstWeak >= 2) { // check if weak obj is a finalizer item
                        var list = weakObj.pointers[Squeak.WeakFinalizerItem_list];
                        if (list.sqClass == this.vm.specialObjects[Squeak.splOb_ClassWeakFinalizer]) {
                            // add weak obj as first in the finalization list
                            var items = list.pointers[Squeak.WeakFinalizationList_first];
                            weakObj.pointers[Squeak.WeakFinalizerItem_next] = items;
                            list.pointers[Squeak.WeakFinalizationList_first] = weakObj;
                        }
                    }
                }
            }        if (this.vm.pendingFinalizationSignals > 0) {
                this.vm.forceInterruptCheck();                      // run finalizer asap
            }
        },
    },
    'garbage collection - partial', {
        partialGC: function(reason) {
            // make a linked list of young objects
            // and finalize weak refs
            this.vm.addMessage("partialGC: " + reason);
            var start = Date.now();
            var young = this.findYoungObjects();
            this.appendToYoungSpace(young);
            this.finalizeWeakReferences();
            this.cleanupYoungSpace(young);
            this.allocationCount += this.newSpaceCount - young.length;
            this.youngSpaceCount = young.length;
            this.newSpaceCount = this.youngSpaceCount;
            this.pgcCount++;
            this.pgcMilliseconds += Date.now() - start;
            console.log("Partial GC (" + reason+ "): " + (Date.now() - start) + " ms");
            return young[0];
        },
        youngRoots: function() {
            // PartialGC: Find new objects directly pointed to by old objects.
            // For speed we only scan "dirty" objects that have been written to
            var roots = this.gcRoots().filter(function(obj){return obj.oop < 0;}),
                object = this.firstOldObject;
            while (object) {
                if (object.dirty) {
                    var body = object.pointers,
                        dirty = false;
                    for (var i = 0; i < body.length; i++) {
                        var child = body[i];
                        if (typeof child === "object" && child.oop < 0) { // if child is new
                            roots.push(child);
                            dirty = true;
                        }
                    }
                    object.dirty = dirty;
                }
                object = object.nextObject;
            }
            return roots;
        },
        findYoungObjects: function() {
            // PartialGC: find new objects transitively reachable from old objects
            var todo = this.youngRoots(),     // direct pointers from old space
                newObjects = [];
            this.weakObjects = [];
            while (todo.length > 0) {
                var object = todo.pop();
                if (object.mark) continue;    // objects are added to todo more than once
                newObjects.push(object);
                object.mark = true;           // mark it
                if (object.sqClass.oop < 0)   // trace class if new
                    todo.push(object.sqClass);
                var body = object.pointers;
                if (body) {                   // trace all unmarked pointers
                    var n = body.length;
                    if (object.isWeak()) {
                        n = object.sqClass.classInstSize();     // do not trace weak fields
                        this.weakObjects.push(object);
                    }
                    if (this.vm.isContext(object)) {            // contexts have garbage beyond SP
                        n = object.contextSizeWithStack();
                        for (var i = n; i < body.length; i++)   // clean up that garbage
                            body[i] = this.vm.nilObj;
                    }
                    for (var i = 0; i < n; i++) {
                        var child = body[i];
                        if (typeof child === "object" && child.oop < 0)
                            todo.push(child);
                    }
                }
            }
            // pre-spur sort by oop to preserve creation order
            return this.isSpur ? newObjects : newObjects.sort(function(a,b){return b.oop - a.oop});
        },
        appendToYoungSpace: function(objects) {
            // PartialGC: link new objects into young list
            // and give them positive oops temporarily so finalization works
            var tempOop = this.lastOldObject.oop + 1;
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (this.hasNewInstances[obj.oop]) {
                    delete this.hasNewInstances[obj.oop];
                    this.hasNewInstances[tempOop] = true;
                }
                obj.oop = tempOop;
                obj.nextObject = objects[i + 1];
                tempOop++;
            }
        },
        cleanupYoungSpace: function(objects) {
            // PartialGC: After finalizing weak refs, make oops
            // in young space negative again
            var obj = objects[0],
                youngOop = -1;
            while (obj) {
                if (this.hasNewInstances[obj.oop]) {
                    delete this.hasNewInstances[obj.oop];
                    this.hasNewInstances[youngOop] = true;
                }
                obj.oop = youngOop;
                obj.mark = false;
                obj = obj.nextObject;
                youngOop--;
            }
        },
    },
    'creating', {
        registerObject: function(obj) {
            // We don't actually register the object yet, because that would prevent
            // it from being garbage-collected by the Javascript collector
            obj.oop = -(++this.newSpaceCount); // temp oops are negative. Real oop assigned when surviving GC
            this.lastHash = (13849 + (27181 * this.lastHash)) & 0xFFFFFFFF;
            return this.lastHash & 0xFFF;
        },
        registerObjectSpur: function(obj) {
            // We don't actually register the object yet, because that would prevent
            // it from being garbage-collected by the Javascript collector
            obj.oop = -(++this.newSpaceCount); // temp oops are negative. Real oop assigned when surviving GC
            return 0; // actual hash created on demand
        },
        instantiateClass: function(aClass, indexableSize, filler) {
            var newObject = new (aClass.classInstProto()); // Squeak.Object
            var hash = this.registerObject(newObject);
            newObject.initInstanceOf(aClass, indexableSize, hash, filler);
            this.hasNewInstances[aClass.oop] = true;   // need GC to find all instances
            return newObject;
        },
        clone: function(object) {
            var newObject = new (object.sqClass.classInstProto()); // Squeak.Object
            var hash = this.registerObject(newObject);
            newObject.initAsClone(object, hash);
            this.hasNewInstances[newObject.sqClass.oop] = true;   // need GC to find all instances
            return newObject;
        },
    },
    'operations', {
        bulkBecome: function(fromArray, toArray, twoWay, copyHash) {
            if (!fromArray)
                return !toArray;
            var n = fromArray.length;
            if (n !== toArray.length)
                return false;
            // need to visit all objects: find young objects now
            // so oops do not change later
            var firstYoungObject = null;
            if (this.newSpaceCount > 0)
                firstYoungObject = this.partialGC("become");  // does update context
            else
                this.vm.storeContextRegisters();    // still need to update active context
            // obj.oop used as dict key here is why we store them
            // rather than just calculating at image snapshot time
            var mutations = {};
            for (var i = 0; i < n; i++) {
                var obj = fromArray[i];
                if (!obj.sqClass) return false;  //non-objects in from array
                if (mutations[obj.oop]) return false; //repeated oops in from array
                else mutations[obj.oop] = toArray[i];
            }
            if (twoWay) for (var i = 0; i < n; i++) {
                var obj = toArray[i];
                if (!obj.sqClass) return false;  //non-objects in to array
                if (mutations[obj.oop]) return false; //repeated oops in to array
                else mutations[obj.oop] = fromArray[i];
            }
            // unless copyHash is false, make hash stay with the reference, not with the object
            if (copyHash) for (var i = 0; i < n; i++) {
                if (!toArray[i].sqClass) return false; //cannot change hash of non-objects
                var fromHash = fromArray[i].hash;
                fromArray[i].hash = toArray[i].hash;
                toArray[i].hash = fromHash;
            }
            // temporarily append young objects to old space
            this.lastOldObject.nextObject = firstYoungObject;
            // Now, for every object...
            var obj = this.firstOldObject;
            while (obj) {
                // mutate the class
                var mut = mutations[obj.sqClass.oop];
                if (mut) {
                    obj.sqClass = mut;
                    if (mut.oop < 0) obj.dirty = true;
                }
                // and mutate body pointers
                var body = obj.pointers;
                if (body) for (var j = 0; j < body.length; j++) {
                    mut = mutations[body[j].oop];
                    if (mut) {
                        body[j] = mut;
                        if (mut.oop < 0) obj.dirty = true;
                    }
                }
                obj = obj.nextObject;
            }
            // separate old / young space again
            this.lastOldObject.nextObject = null;
            this.vm.flushMethodCacheAfterBecome(mutations);
            return true;
        },
        objectAfter: function(obj) {
            // if this was the last old object, continue with young objects
            return obj.nextObject || this.nextObjectWithGC("nextObject", obj);
        },
        someInstanceOf: function(clsObj) {
            var obj = this.firstOldObject;
            while (obj) {
                if (obj.sqClass === clsObj)
                    return obj;
                obj = obj.nextObject || this.nextObjectWithGCFor(obj, clsObj);
            }
            return null;
        },
        nextInstanceAfter: function(obj) {
            var clsObj = obj.sqClass;
            while (true) {
                obj = obj.nextObject || this.nextObjectWithGCFor(obj, clsObj);
                if (!obj) return null;
                if (obj.sqClass === clsObj)
                    return obj;
            }
        },
        nextObjectWithGC: function(reason, obj) {
            // obj is either the last object in old space (after enumerating it)
            // or young space (after enumerating the list returned by partialGC)
            // or a random new object
            var limit = obj.oop > 0 ? 0 : this.youngSpaceCount;
            if (this.newSpaceCount <= limit) return null; // no more objects
            if (obj.oop < 0) this.fullGC(reason); // found a non-young new object
            return this.partialGC(reason);
        },
        nextObjectWithGCFor: function(obj, clsObj) {
            // this is nextObjectWithGC but avoids GC if no instances in new space
            if (!this.hasNewInstances[clsObj.oop]) return null;
            return this.nextObjectWithGC("instance of " + clsObj.className(), obj);
        },
        allInstancesOf: function(clsObj) {
            var obj = this.firstOldObject,
                result = [];
            while (obj) {
                if (obj.sqClass === clsObj) result.push(obj);
                obj = obj.nextObject || this.nextObjectWithGCFor(obj, clsObj);
            }
            return result;
        },
        writeToBuffer: function() {
            var headerSize = 64,
                data = new DataView(new ArrayBuffer(headerSize + this.oldSpaceBytes)),
                pos = 0;
            var writeWord = function(word) {
                data.setUint32(pos, word);
                pos += 4;
            };
            writeWord(this.formatVersion()); // magic number
            writeWord(headerSize);
            writeWord(this.oldSpaceBytes); // end of memory
            writeWord(this.firstOldObject.addr()); // base addr (0)
            writeWord(this.objectToOop(this.specialObjectsArray));
            writeWord(this.lastHash);
            writeWord((800 << 16) + 600);  // window size
            while (pos < headerSize)
                writeWord(0);
            // objects
            var obj = this.firstOldObject,
                n = 0;
            while (obj) {
                pos = obj.writeTo(data, pos, this);
                obj = obj.nextObject;
                n++;
            }
            if (pos !== data.byteLength) throw Error("wrong image size");
            if (n !== this.oldSpaceCount) throw Error("wrong object count");
            return data.buffer;
        },
        objectToOop: function(obj) {
            // unsigned word for use in snapshot
            if (typeof obj ===  "number")
                return obj << 1 | 1; // add tag bit
            if (obj.oop < 0) throw Error("temporary oop");
            return obj.oop;
        },
        bytesLeft: function() {
            return this.totalMemory - this.oldSpaceBytes;
        },
        formatVersion: function() {
            return this.isSpur ? 6521 : this.hasClosures ? 6504 : 6502;
        },
        segmentVersion: function() {
            var dnu = this.specialObjectsArray.pointers[Squeak.splOb_SelectorDoesNotUnderstand],
                wholeWord = new Uint32Array(dnu.bytes.buffer, 0, 1);
            return this.formatVersion() | (wholeWord[0] & 0xFF000000);
        },
        loadImageSegment: function(segmentWordArray, outPointerArray) {
            // The C VM creates real objects from the segment in-place.
            // We do the same, linking the new objects directly into old-space.
            // The code below is almost the same as readFromBuffer() ... should unify
            var data = new DataView(segmentWordArray.words.buffer),
                littleEndian = false,
                nativeFloats = false,
                pos = 0;
            var readWord = function() {
                var int = data.getUint32(pos, littleEndian);
                pos += 4;
                return int;
            };
            var readBits = function(nWords, format) {
                if (format < 5) { // pointers (do endian conversion)
                    var oops = [];
                    while (oops.length < nWords)
                        oops.push(readWord());
                    return oops;
                } else { // words (no endian conversion yet)
                    var bits = new Uint32Array(data.buffer, pos, nWords);
                    pos += nWords * 4;
                    return bits;
                }
            };
            // check version
            var version = readWord();
            if (version & 0xFFFF !== 6502) {
                littleEndian = true; pos = 0;
                version = readWord();
                if (version & 0xFFFF !== 6502) {
                    console.error("image segment format not supported");
                    return null;
                }
            }
            // read objects
            this.tenureIfYoung(segmentWordArray);
            var prevObj = segmentWordArray,
                endMarker = prevObj.nextObject,
                oopOffset = segmentWordArray.oop,
                oopMap = {},
                rawBits = {};
            while (pos < data.byteLength) {
                var nWords = 0,
                    classInt = 0,
                    header = readWord();
                switch (header & Squeak.HeaderTypeMask) {
                    case Squeak.HeaderTypeSizeAndClass:
                        nWords = header >>> 2;
                        classInt = readWord();
                        header = readWord();
                        break;
                    case Squeak.HeaderTypeClass:
                        classInt = header - Squeak.HeaderTypeClass;
                        header = readWord();
                        nWords = (header >>> 2) & 63;
                        break;
                    case Squeak.HeaderTypeShort:
                        nWords = (header >>> 2) & 63;
                        classInt = (header >>> 12) & 31; //compact class index
                        //Note classInt<32 implies compact class index
                        break;
                    case Squeak.HeaderTypeFree:
                        throw Error("Unexpected free block");
                }
                nWords--;  //length includes base header which we have already read
                var oop = pos, //0-rel byte oop of this object (base header)
                    format = (header>>>8) & 15,
                    hash = (header>>>17) & 4095,
                    bits = readBits(nWords, format);

                var object = new Squeak.Object();
                object.initFromImage(oop + oopOffset, classInt, format, hash);
                prevObj.nextObject = object;
                this.oldSpaceCount++;
                prevObj = object;
                oopMap[oop] = object;
                rawBits[oop + oopOffset] = bits;
            }
            object.nextObject = endMarker;
            // add outPointers to oopMap
            for (var i = 0; i < outPointerArray.pointers.length; i++)
                oopMap[0x80000004 + i * 4] = outPointerArray.pointers[i];
            // add compactClasses to oopMap
            var compactClasses = this.specialObjectsArray.pointers[Squeak.splOb_CompactClasses].pointers,
                fakeClsOop = 0, // make up a compact-classes array with oops, as if loading an image
                compactClassOops = compactClasses.map(function(cls) {
                    oopMap[--fakeClsOop] = cls; return fakeClsOop; });
            // truncate segmentWordArray array to one element
            segmentWordArray.words = new Uint32Array([segmentWordArray.words[0]]);
            // map objects using oopMap
            var roots = segmentWordArray.nextObject,
                floatClass = this.specialObjectsArray.pointers[Squeak.splOb_ClassFloat],
                obj = roots;
            do {
                obj.installFromImage(oopMap, rawBits, compactClassOops, floatClass, littleEndian, nativeFloats);
                obj = obj.nextObject;
            } while (obj !== endMarker);
            return roots;
        },
    },
    'spur support',
    {
        initSpurOverrides: function() {
            this.registerObject = this.registerObjectSpur;
            this.writeToBuffer = this.writeToBufferSpur;
        },
        spurClassTable: function(oopMap, rawBits, classPages, splObjs) {
            var classes = {},
                nil = this.firstOldObject;
            // read class table pages
            for (var p = 0; p < 4096; p++) {
                var page = oopMap[classPages[p]];
                if (page.oop) page = rawBits[page.oop]; // page was not properly hidden
                if (page.length === 1024) for (var i = 0; i < 1024; i++) {
                    var entry = oopMap[page[i]];
                    if (!entry) throw Error("Invalid class table entry (oop " + page[i] + ")");
                    if (entry !== nil) {
                        var classIndex = p * 1024 + i;
                        classes[classIndex] = entry;
                    }
                }
            }
            // add known classes which may not be in the table
            for (var key in Squeak) {
                if (/^splOb_Class/.test(key)) {
                    var knownClass = oopMap[rawBits[splObjs.oop][Squeak[key]]];
                    if (knownClass !== nil) {
                        var classIndex = knownClass.hash;
                        if (classIndex > 0 && classIndex < 1024)
                            classes[classIndex] = knownClass;
                    }
                }
            }
            classes[3] = classes[1];      // SmallInteger needs two entries
            this.classTable = classes;
            this.classTableIndex = 1024;  // first page is special
            return classes;
        },
        enterIntoClassTable: function(newClass) {
            var index = this.classTableIndex,
                table = this.classTable;
            while (index <= 0x3FFFFF) {
                if (!table[index]) {
                    table[index] = newClass;
                    newClass.hash = index;
                    this.classTableIndex = index;
                    return index;
                }
                index++;
            }
            console.error("class table full?"); // todo: clean out old class table entries
            return null;
        },
        initImmediateClasses: function(oopMap, rawBits, splObs) {
            var special = rawBits[splObs.oop];
            this.characterClass = oopMap[special[Squeak.splOb_ClassCharacter]];
            this.floatClass = oopMap[special[Squeak.splOb_ClassFloat]];
            this.largePosIntClass = oopMap[special[Squeak.splOb_ClassLargePositiveInteger]];
            this.largeNegIntClass = oopMap[special[Squeak.splOb_ClassLargeNegativeInteger]];
            // init named prototypes
            this.characterClass.classInstProto("Character");
            this.floatClass.classInstProto("BoxedFloat64");
            this.largePosIntClass.classInstProto("LargePositiveInteger");
            this.largeNegIntClass.classInstProto("LargeNegativeInteger");
            this.characterTable = {};
        },
        getCharacter: function(unicode) {
            var char = this.characterTable[unicode];
            if (!char) {
                char = new this.characterClass.instProto;
                char.initInstanceOfChar(this.characterClass, unicode);
                this.characterTable[unicode] = char;
            }
            return char;
        },
        instantiateFloat: function(bits) {
            var float = new this.floatClass.instProto;
            this.registerObjectSpur(float);
            this.hasNewInstances[this.floatClass.oop] = true;
            float.initInstanceOfFloat(this.floatClass, bits);
            return float;
        },
        instantiateLargeFromSmall: function(hi, lo) {
            // get rid of 3 tag bits
            lo = hi << 29 | lo >>> 3 ; // shift 3 bits from hi to lo
            hi = hi >> 3; // shift by 3 with sign extension
            // value is always positive, class determines sign
            var negative = hi < 0;
            if (negative) { hi = -hi; lo = -lo; if (lo !== 0) hi--; }
            var size = hi === 0 ? 4 : hi <= 0xFF ? 5 : hi <= 0xFFFF ? 6 : hi <= 0xFFFFFF ? 7 : 8;
            var largeIntClass = negative ? this.largeNegIntClass : this.largePosIntClass;
            var largeInt = new largeIntClass.instProto;
            this.registerObjectSpur(largeInt);
            this.hasNewInstances[largeIntClass.oop] = true;
            largeInt.initInstanceOfLargeInt(largeIntClass, size);
            var bytes = largeInt.bytes;
            for (var i = 0; i < 4; i++) { bytes[i] = lo & 255; lo >>= 8; }
            for (var i = 4; i < size; i++) { bytes[i] = hi & 255; hi >>= 8; }
            return largeInt;
        },
        ensureClassesInTable: function() {
            // make sure all classes are in class table
            // answer number of class pages
            var obj = this.firstOldObject;
            var maxIndex = 1024; // at least one page
            while (obj) {
                var cls = obj.sqClass;
                if (cls.hash === 0) this.enterIntoClassTable(cls);
                if (cls.hash > maxIndex) maxIndex = cls.hash;
                if (this.classTable[cls.hash] !== cls) throw Error("Class not in class table");
                obj = obj.nextObject;
            }
            return (maxIndex >> 10) + 1;
        },
        classTableBytes: function(numPages) {
            // space needed for master table and minor pages
            return (4 + 4104 + numPages * (4 + 1024)) * 4;
        },
        writeFreeLists: function(data, pos, littleEndian, oopOffset) {
            // we fake an empty free lists object
            data.setUint32(pos, 0x0A000012, littleEndian); pos += 4;
            data.setUint32(pos, 0x20000000, littleEndian); pos += 4;
            pos += 32 * 4;  // 32 zeros
            return pos;
        },
        writeClassTable: function(data, pos, littleEndian, objToOop, numPages) {
            // write class tables as Spur expects them, faking their oops
            var nilFalseTrueBytes = 3 * 16,
                freeListBytes = 8 + 32 * 4,
                majorTableSlots = 4096 + 8,         // class pages plus 8 hiddenRootSlots
                minorTableSlots = 1024,
                majorTableBytes = 16 + majorTableSlots * 4,
                minorTableBytes = 16 + minorTableSlots * 4,
                firstPageOop = nilFalseTrueBytes + freeListBytes + majorTableBytes + 8;
            // major table
            data.setUint32(pos, majorTableSlots, littleEndian); pos += 4;
            data.setUint32(pos,      0xFF000000, littleEndian); pos += 4;
            data.setUint32(pos,      0x02000010, littleEndian); pos += 4;
            data.setUint32(pos,      0xFF000000, littleEndian); pos += 4;
            for (var p = 0; p < numPages; p++) {
                data.setUint32(pos, firstPageOop + p * minorTableBytes, littleEndian); pos += 4;
            }
            pos += (majorTableSlots - numPages) * 4;  // rest is nil
            // minor tables
            var classID = 0;
            for (var p = 0; p < numPages; p++) {
                data.setUint32(pos, minorTableSlots, littleEndian); pos += 4;
                data.setUint32(pos,      0xFF000000, littleEndian); pos += 4;
                data.setUint32(pos,      0x02000010, littleEndian); pos += 4;
                data.setUint32(pos,      0xFF000000, littleEndian); pos += 4;
                for (var i = 0; i < minorTableSlots; i++) {
                    var classObj = this.classTable[classID];
                    if (classObj && classObj.pointers) {
                        if (!classObj.hash) throw Error("class without id");
                        if (classObj.hash !== classID && classID >= 32) {
                            console.warn("freeing class index " + classID + " " + classObj.className());
                            classObj = null;
                        }
                    }
                    if (classObj) data.setUint32(pos, objToOop(classObj), littleEndian);
                    pos += 4;
                    classID++;
                }
            }
            return pos;
        },
        writeToBufferSpur: function() {
            var headerSize = 64,
                trailerSize = 16,
                freeListsSize = 136,
                numPages = this.ensureClassesInTable(),
                hiddenSize = freeListsSize + this.classTableBytes(numPages),
                data = new DataView(new ArrayBuffer(headerSize + hiddenSize + this.oldSpaceBytes + trailerSize)),
                littleEndian = true,
                start = Date.now(),
                pos = 0;
            function writeWord(word) {
                data.setUint32(pos, word, littleEndian);
                pos += 4;
            }        function objToOop(obj) {
                if (typeof obj === "number")
                    return obj << 1 | 1; // add tag bit
                if (obj._format === 7) {
                    if (obj.hash !== (obj.oop >> 2) || (obj.oop & 3) !== 2)
                        throw Error("Bad immediate char");
                    return obj.oop;
                }
                if (obj.oop < 0) throw Error("temporary oop");
                // oops after nil/false/true are shifted by size of hidden objects
                return obj.oop < 48 ? obj.oop : obj.oop + hiddenSize;
            }        writeWord(this.formatVersion()); // magic number
            writeWord(headerSize);
            writeWord(hiddenSize + this.oldSpaceBytes + trailerSize); // end of memory
            writeWord(this.firstOldObject.addr()); // base addr (0)
            writeWord(objToOop(this.specialObjectsArray));
            this.savedHeaderWords.forEach(writeWord);
            writeWord(hiddenSize + this.oldSpaceBytes + trailerSize); //first segment size
            while (pos < headerSize)
                writeWord(0);
            // write objects
            var obj = this.firstOldObject,
                n = 0;
            pos = obj.writeTo(data, pos, littleEndian, objToOop); obj = obj.nextObject; n++; // write nil
            pos = obj.writeTo(data, pos, littleEndian, objToOop); obj = obj.nextObject; n++; // write false
            pos = obj.writeTo(data, pos, littleEndian, objToOop); obj = obj.nextObject; n++; // write true
            pos = this.writeFreeLists(data, pos, littleEndian, objToOop); // write hidden free list
            pos = this.writeClassTable(data, pos, littleEndian, objToOop, numPages); // write hidden class table
            while (obj) {
                pos = obj.writeTo(data, pos, littleEndian, objToOop);
                obj = obj.nextObject;
                n++;
            }
            // write segement trailer
            writeWord(0x4A000003);
            writeWord(0x00800000);
            writeWord(0);
            writeWord(0);
            // done
            if (pos !== data.byteLength) throw Error("wrong image size");
            if (n !== this.oldSpaceCount) throw Error("wrong object count");
            var time = Date.now() - start;
            console.log("Wrote " + n + " objects in " + time + " ms, image size " + pos + " bytes");
            return data.buffer;
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.Interpreter',
    'initialization', {
        initialize: function(image, display) {
            console.log('squeak: initializing interpreter ' + Squeak.vmVersion);
            this.Squeak = Squeak;   // store locally to avoid dynamic lookup in Lively
            this.image = image;
            this.image.vm = this;
            this.primHandler = new Squeak.Primitives(this, display);
            this.loadImageState();
            this.hackImage();
            this.initVMState();
            this.loadInitialContext();
            this.initCompiler();
            console.log('squeak: ready');
        },
        loadImageState: function() {
            this.specialObjects = this.image.specialObjectsArray.pointers;
            this.specialSelectors = this.specialObjects[Squeak.splOb_SpecialSelectors].pointers;
            this.nilObj = this.specialObjects[Squeak.splOb_NilObject];
            this.falseObj = this.specialObjects[Squeak.splOb_FalseObject];
            this.trueObj = this.specialObjects[Squeak.splOb_TrueObject];
            this.hasClosures = this.image.hasClosures;
            this.globals = this.findGlobals();
            // hack for old image that does not support Unix files
            if (!this.hasClosures && !this.findMethod("UnixFileDirectory class>>pathNameDelimiter"))
                this.primHandler.emulateMac = true;
            // pre-release image has inverted colors
            if (this.image.version == 6501)
                this.primHandler.reverseDisplay = true;
        },
        initVMState: function() {
            this.byteCodeCount = 0;
            this.sendCount = 0;
            this.interruptCheckCounter = 0;
            this.interruptCheckCounterFeedBackReset = 1000;
            this.interruptChecksEveryNms = 3;
            this.nextPollTick = 0;
            this.nextWakeupTick = 0;
            this.lastTick = 0;
            this.interruptKeycode = 2094;  //"cmd-."
            this.interruptPending = false;
            this.pendingFinalizationSignals = 0;
            this.freeContexts = this.nilObj;
            this.freeLargeContexts = this.nilObj;
            this.reclaimableContextCount = 0;
            this.nRecycledContexts = 0;
            this.nAllocatedContexts = 0;
            this.methodCacheSize = 1024;
            this.methodCacheMask = this.methodCacheSize - 1;
            this.methodCacheRandomish = 0;
            this.methodCache = [];
            for (var i = 0; i < this.methodCacheSize; i++)
                this.methodCache[i] = {lkupClass: null, selector: null, method: null, primIndex: 0, argCount: 0, mClass: null};
            this.breakOutOfInterpreter = false;
            this.breakOutTick = 0;
            this.breakOnMethod = null; // method to break on
            this.breakOnNewMethod = false;
            this.breakOnContextChanged = false;
            this.breakOnContextReturned = null; // context to break on
            this.messages = {};
            this.startupTime = Date.now(); // base for millisecond clock
        },
        loadInitialContext: function() {
            var schedAssn = this.specialObjects[Squeak.splOb_SchedulerAssociation];
            var sched = schedAssn.pointers[Squeak.Assn_value];
            var proc = sched.pointers[Squeak.ProcSched_activeProcess];
            this.activeContext = proc.pointers[Squeak.Proc_suspendedContext];
            this.activeContext.dirty = true;
            this.fetchContextRegisters(this.activeContext);
            this.reclaimableContextCount = 0;
        },
        findGlobals: function() {
            var smalltalk = this.specialObjects[Squeak.splOb_SmalltalkDictionary],
                smalltalkClass = smalltalk.sqClass.className();
            if (smalltalkClass === "Association") {
                smalltalk = smalltalk.pointers[1];
                smalltalkClass = smalltalk.sqClass.className();
            }
            if (smalltalkClass === "SystemDictionary")
                return smalltalk.pointers[1].pointers;
            if (smalltalkClass === "SmalltalkImage") {
                var globals = smalltalk.pointers[0],
                    globalsClass = globals.sqClass.className();
                if (globalsClass === "SystemDictionary")
                    return globals.pointers[1].pointers;
                if (globalsClass === "Environment")
                    return globals.pointers[2].pointers[1].pointers
            }
            console.warn("cannot find global dict");
            return [];
        },
        initCompiler: function() {
            if (!Squeak.Compiler)
                return console.warn("Squeak.Compiler not loaded, using interpreter only");
            // some JS environments disallow creating functions at runtime (e.g. FireFox OS apps)
            try {
                if (new Function("return 42")() !== 42)
                    return console.warn("function constructor not working, disabling JIT");
            } catch (e) {
                return console.warn("disabling JIT: " + e);
            }
            // disable JIT on slow machines, which are likely memory-limited
            var kObjPerSec = this.image.oldSpaceCount / (this.startupTime - this.image.startupTime);
            if (kObjPerSec < 10)
                return console.warn("Slow machine detected (loaded " + (kObjPerSec*1000|0) + " objects/sec), using interpreter only");
            // compiler might decide to not handle current image
            try {
                console.log("squeak: initializing JIT compiler");
                this.compiler = new Squeak.Compiler(this);
            } catch(e) {
                console.warn("Compiler " + e);
            }
        },
        hackImage: function() {
            // hack methods to make work / speed up
            var opts = typeof location === 'object' ? location.hash : "";
            [
                // Etoys fallback for missing translation files is hugely inefficient.
                // This speeds up opening a viewer by 10x (!)
                // Remove when we added translation files.
                //{method: "String>>translated", primitive: returnSelf, enabled: true},
                //{method: "String>>translatedInAllDomains", primitive: returnSelf, enabled: true},
                // 64 bit Squeak does not flush word size on snapshot
                {method: "SmalltalkImage>>wordSize", literal: {index: 1, old: 8, hack: 4}, enabled: true},
                // Squeak 5.3 disable wizard by replacing #open send with pop
                {method: "ReleaseBuilder class>>prepareEnvironment", bytecode: {pc: 28, old: 0xD8, hack: 0x87}, enabled: opts.includes("wizard=false")},
            ].forEach(function(each) {
                try {
                    var m = each.enabled && this.findMethod(each.method);
                    if (m) {
                        var prim = each.primitive,
                            byte = each.bytecode,
                            lit = each.literal,
                            hacked = true;
                        if (prim) m.pointers[0] |= prim;
                        else if (byte && m.bytes[byte.pc] === byte.old) m.bytes[byte.pc] = byte.hack;
                        else if (byte && m.bytes[byte.pc] === byte.hack) hacked = false; // already there
                        else if (lit && m.pointers[lit.index].pointers[1] === lit.old) m.pointers[lit.index].pointers[1] = lit.hack;
                        else if (lit && m.pointers[lit.index].pointers[1] === lit.hack) hacked = false; // already there
                        else { hacked = false; console.error("Failed to hack " + each.method); }
                        if (hacked) console.warn("Hacking " + each.method);
                    }
                } catch (error) {
                    console.error("Failed to hack " + each.method + " with error " + error);
                }

            }, this);
        },
    },
    'interpreting', {
        interpretOne: function(singleStep) {
            if (this.method.methodSignFlag()) {
                return this.interpretOneSistaWithExtensions(singleStep, 0, 0);
            }
            if (this.method.compiled) {
                if (singleStep) {
                    if (!this.compiler.enableSingleStepping(this.method)) {
                        this.method.compiled = null;
                        return this.interpretOne(singleStep);
                    }
                    this.breakNow();
                }
                this.method.compiled(this);
                return;
            }
            var Squeak = this.Squeak; // avoid dynamic lookup of "Squeak" in Lively
            var b, b2;
            this.byteCodeCount++;
            b = this.nextByte();
            switch (b) { /* The Main V3 Bytecode Dispatch Loop */

                // load receiver variable
                case 0x00: case 0x01: case 0x02: case 0x03: case 0x04: case 0x05: case 0x06: case 0x07:
                case 0x08: case 0x09: case 0x0A: case 0x0B: case 0x0C: case 0x0D: case 0x0E: case 0x0F:
                    this.push(this.receiver.pointers[b&0xF]); return;

                // load temporary variable
                case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x17:
                case 0x18: case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E: case 0x1F:
                    this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+(b&0xF)]); return;

                // loadLiteral
                case 0x20: case 0x21: case 0x22: case 0x23: case 0x24: case 0x25: case 0x26: case 0x27:
                case 0x28: case 0x29: case 0x2A: case 0x2B: case 0x2C: case 0x2D: case 0x2E: case 0x2F:
                case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37:
                case 0x38: case 0x39: case 0x3A: case 0x3B: case 0x3C: case 0x3D: case 0x3E: case 0x3F:
                    this.push(this.method.methodGetLiteral(b&0x1F)); return;

                // loadLiteralIndirect
                case 0x40: case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46: case 0x47:
                case 0x48: case 0x49: case 0x4A: case 0x4B: case 0x4C: case 0x4D: case 0x4E: case 0x4F:
                case 0x50: case 0x51: case 0x52: case 0x53: case 0x54: case 0x55: case 0x56: case 0x57:
                case 0x58: case 0x59: case 0x5A: case 0x5B: case 0x5C: case 0x5D: case 0x5E: case 0x5F:
                    this.push((this.method.methodGetLiteral(b&0x1F)).pointers[Squeak.Assn_value]); return;

                // storeAndPop rcvr, temp
                case 0x60: case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66: case 0x67:
                    this.receiver.dirty = true;
                    this.receiver.pointers[b&7] = this.pop(); return;
                case 0x68: case 0x69: case 0x6A: case 0x6B: case 0x6C: case 0x6D: case 0x6E: case 0x6F:
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+(b&7)] = this.pop(); return;

                // Quick push
                case 0x70: this.push(this.receiver); return;
                case 0x71: this.push(this.trueObj); return;
                case 0x72: this.push(this.falseObj); return;
                case 0x73: this.push(this.nilObj); return;
                case 0x74: this.push(-1); return;
                case 0x75: this.push(0); return;
                case 0x76: this.push(1); return;
                case 0x77: this.push(2); return;

                // Quick return
                case 0x78: this.doReturn(this.receiver); return;
                case 0x79: this.doReturn(this.trueObj); return;
                case 0x7A: this.doReturn(this.falseObj); return;
                case 0x7B: this.doReturn(this.nilObj); return;
                case 0x7C: this.doReturn(this.pop()); return;
                case 0x7D: this.doReturn(this.pop(), this.activeContext.pointers[Squeak.BlockContext_caller]); return; // blockReturn
                case 0x7E: this.nono(); return;
                case 0x7F: this.nono(); return;
                // Sundry
                case 0x80: this.extendedPush(this.nextByte()); return;
                case 0x81: this.extendedStore(this.nextByte()); return;
                case 0x82: this.extendedStorePop(this.nextByte()); return;
                // singleExtendedSend
                case 0x83: b2 = this.nextByte(); this.send(this.method.methodGetSelector(b2&31), b2>>5, false); return;
                case 0x84: this.doubleExtendedDoAnything(this.nextByte()); return;
                // singleExtendedSendToSuper
                case 0x85: b2= this.nextByte(); this.send(this.method.methodGetSelector(b2&31), b2>>5, true); return;
                // secondExtendedSend
                case 0x86: b2= this.nextByte(); this.send(this.method.methodGetSelector(b2&63), b2>>6, false); return;
                case 0x87: this.pop(); return;  // pop
                case 0x88: this.push(this.top()); return;   // dup
                // thisContext
                case 0x89: this.push(this.exportThisContext()); return;

                // Closures
                case 0x8A: this.pushNewArray(this.nextByte());   // create new temp vector
                    return;
                case 0x8B: this.callPrimBytecode(0x81);
                    return;
                case 0x8C: b2 = this.nextByte(); // remote push from temp vector
                    this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+this.nextByte()].pointers[b2]);
                    return;
                case 0x8D: b2 = this.nextByte(); // remote store into temp vector
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+this.nextByte()].pointers[b2] = this.top();
                    return;
                case 0x8E: b2 = this.nextByte(); // remote store and pop into temp vector
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+this.nextByte()].pointers[b2] = this.pop();
                    return;
                case 0x8F: this.pushClosureCopy(); return;

                // Short jmp
                case 0x90: case 0x91: case 0x92: case 0x93: case 0x94: case 0x95: case 0x96: case 0x97:
                    this.pc += (b&7)+1; return;
                // Short conditional jump on false
                case 0x98: case 0x99: case 0x9A: case 0x9B: case 0x9C: case 0x9D: case 0x9E: case 0x9F:
                    this.jumpIfFalse((b&7)+1); return;
                // Long jump, forward and back
                case 0xA0: case 0xA1: case 0xA2: case 0xA3: case 0xA4: case 0xA5: case 0xA6: case 0xA7:
                    b2 = this.nextByte();
                    this.pc += (((b&7)-4)*256 + b2);
                    if ((b&7)<4)        // check for process switch on backward jumps (loops)
                        if (this.interruptCheckCounter-- <= 0) this.checkForInterrupts();
                    return;
                // Long conditional jump on true
                case 0xA8: case 0xA9: case 0xAA: case 0xAB:
                    this.jumpIfTrue((b&3)*256 + this.nextByte()); return;
                // Long conditional jump on false
                case 0xAC: case 0xAD: case 0xAE: case 0xAF:
                    this.jumpIfFalse((b&3)*256 + this.nextByte()); return;

                // Arithmetic Ops... + - < > <= >= = ~=    * /  @ lshift: lxor: land: lor:
                case 0xB0: this.success = true; this.resultIsFloat = false;
                    if(!this.pop2AndPushNumResult(this.stackIntOrFloat(1) + this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // PLUS +
                case 0xB1: this.success = true; this.resultIsFloat = false;
                    if(!this.pop2AndPushNumResult(this.stackIntOrFloat(1) - this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // MINUS -
                case 0xB2: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) < this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // LESS <
                case 0xB3: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) > this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // GRTR >
                case 0xB4: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) <= this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // LEQ <=
                case 0xB5: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) >= this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // GEQ >=
                case 0xB6: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) === this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // EQU =
                case 0xB7: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) !== this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // NEQ ~=
                case 0xB8: this.success = true; this.resultIsFloat = false;
                    if(!this.pop2AndPushNumResult(this.stackIntOrFloat(1) * this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // TIMES *
                case 0xB9: this.success = true;
                    if(!this.pop2AndPushIntResult(this.quickDivide(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return;  // Divide /
                case 0xBA: this.success = true;
                    if(!this.pop2AndPushIntResult(this.mod(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return;  // MOD \
                case 0xBB: this.success = true;
                    if(!this.primHandler.primitiveMakePoint(1, true)) this.sendSpecial(b&0xF); return;  // MakePt int@int
                case 0xBC: this.success = true;
                    if(!this.pop2AndPushIntResult(this.safeShift(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return; // bitShift:
                case 0xBD: this.success = true;
                    if(!this.pop2AndPushIntResult(this.div(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return;  // Divide //
                case 0xBE: this.success = true;
                    if(!this.pop2AndPushIntResult(this.stackInteger(1) & this.stackInteger(0))) this.sendSpecial(b&0xF); return; // bitAnd:
                case 0xBF: this.success = true;
                    if(!this.pop2AndPushIntResult(this.stackInteger(1) | this.stackInteger(0))) this.sendSpecial(b&0xF); return; // bitOr:

                // at:, at:put:, size, next, nextPut:, ...
                case 0xC0: case 0xC1: case 0xC2: case 0xC3: case 0xC4: case 0xC5: case 0xC6: case 0xC7:
                case 0xC8: case 0xC9: case 0xCA: case 0xCB: case 0xCC: case 0xCD: case 0xCE: case 0xCF:
                    if (!this.primHandler.quickSendOther(this.receiver, b&0xF))
                        this.sendSpecial((b&0xF)+16); return;

                // Send Literal Selector with 0, 1, and 2 args
                case 0xD0: case 0xD1: case 0xD2: case 0xD3: case 0xD4: case 0xD5: case 0xD6: case 0xD7:
                case 0xD8: case 0xD9: case 0xDA: case 0xDB: case 0xDC: case 0xDD: case 0xDE: case 0xDF:
                    this.send(this.method.methodGetSelector(b&0xF), 0, false); return;
                case 0xE0: case 0xE1: case 0xE2: case 0xE3: case 0xE4: case 0xE5: case 0xE6: case 0xE7:
                case 0xE8: case 0xE9: case 0xEA: case 0xEB: case 0xEC: case 0xED: case 0xEE: case 0xEF:
                    this.send(this.method.methodGetSelector(b&0xF), 1, false); return;
                case 0xF0: case 0xF1: case 0xF2: case 0xF3: case 0xF4: case 0xF5: case 0xF6: case 0xF7:
                case 0xF8: case 0xF9: case 0xFA: case 0xFB: case 0xFC: case 0xFD: case 0xFE: case 0xFF:
                    this.send(this.method.methodGetSelector(b&0xF), 2, false); return;
            }
            throw Error("not a bytecode: " + b);
        },
        interpretOneSistaWithExtensions: function(singleStep, extA, extB) {
            var Squeak = this.Squeak; // avoid dynamic lookup of "Squeak" in Lively
            var b, b2;
            this.byteCodeCount++;
            b = this.nextByte();
            switch (b) { /* The Main Sista Bytecode Dispatch Loop */

                // 1 Byte Bytecodes

                // load receiver variable
                case 0x00: case 0x01: case 0x02: case 0x03: case 0x04: case 0x05: case 0x06: case 0x07:
                case 0x08: case 0x09: case 0x0A: case 0x0B: case 0x0C: case 0x0D: case 0x0E: case 0x0F:
                    this.push(this.receiver.pointers[b&0xF]); return;

                // load literal variable
                case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x17:
                case 0x18: case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E: case 0x1F:
                    this.push((this.method.methodGetLiteral(b&0xF)).pointers[Squeak.Assn_value]); return;

                // load literal constant
                case 0x20: case 0x21: case 0x22: case 0x23: case 0x24: case 0x25: case 0x26: case 0x27:
                case 0x28: case 0x29: case 0x2A: case 0x2B: case 0x2C: case 0x2D: case 0x2E: case 0x2F:
                case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37:
                case 0x38: case 0x39: case 0x3A: case 0x3B: case 0x3C: case 0x3D: case 0x3E: case 0x3F:
                    this.push(this.method.methodGetLiteral(b&0x1F)); return;

                // load temporary variable
                case 0x40: case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46: case 0x47:
                    this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+(b&0x7)]); return;
                case 0x48: case 0x49: case 0x4A: case 0x4B:
                    this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+(b&0x3)+8]); return;

                case 0x4C: this.push(this.receiver); return;
                case 0x4D: this.push(this.trueObj); return;
                case 0x4E: this.push(this.falseObj); return;
                case 0x4F: this.push(this.nilObj); return;
                case 0x50: this.push(0); return;
                case 0x51: this.push(1); return;
                case 0x52:
                    if (extB == 0) {
                        this.push(this.exportThisContext()); return;
                    } else {
                        this.nono(); return;
                    }
                case 0x53: this.push(this.top()); return;
                case 0x54: case 0x55: case 0x56: case 0x57: this.nono(); return; // unused
                case 0x58: this.doReturn(this.receiver); return;
                case 0x59: this.doReturn(this.trueObj); return;
                case 0x5A: this.doReturn(this.falseObj); return;
                case 0x5B: this.doReturn(this.nilObj); return;
                case 0x5C: this.doReturn(this.pop()); return;
                case 0x5D: this.doReturn(this.nilObj, this.activeContext.pointers[Squeak.BlockContext_caller]); return; // blockReturn nil
                case 0x5E:
                    if (extA == 0) {
                        this.doReturn(this.pop(), this.activeContext.pointers[Squeak.BlockContext_caller]); return; // blockReturn
                    } else {
                        this.nono(); return;
                    }
                case 0x5F:
                    return; // nop

                 // Arithmetic Ops... + - < > <= >= = ~=    * /  @ lshift: lxor: land: lor:
                 case 0x60: this.success = true; this.resultIsFloat = false;
                    if(!this.pop2AndPushNumResult(this.stackIntOrFloat(1) + this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // PLUS +
                case 0x61: this.success = true; this.resultIsFloat = false;
                    if(!this.pop2AndPushNumResult(this.stackIntOrFloat(1) - this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // MINUS -
                case 0x62: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) < this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // LESS <
                case 0x63: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) > this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // GRTR >
                case 0x64: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) <= this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // LEQ <=
                case 0x65: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) >= this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // GEQ >=
                case 0x66: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) === this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // EQU =
                case 0x67: this.success = true;
                    if(!this.pop2AndPushBoolResult(this.stackIntOrFloat(1) !== this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // NEQ ~=
                case 0x68: this.success = true; this.resultIsFloat = false;
                    if(!this.pop2AndPushNumResult(this.stackIntOrFloat(1) * this.stackIntOrFloat(0))) this.sendSpecial(b&0xF); return;  // TIMES *
                case 0x69: this.success = true;
                    if(!this.pop2AndPushIntResult(this.quickDivide(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return;  // Divide /
                case 0x6A: this.success = true;
                    if(!this.pop2AndPushIntResult(this.mod(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return;  // MOD \
                case 0x6B: this.success = true;
                    if(!this.primHandler.primitiveMakePoint(1, true)) this.sendSpecial(b&0xF); return;  // MakePt int@int
                case 0x6C: this.success = true;
                    if(!this.pop2AndPushIntResult(this.safeShift(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return; // bitShift:
                case 0x6D: this.success = true;
                    if(!this.pop2AndPushIntResult(this.div(this.stackInteger(1),this.stackInteger(0)))) this.sendSpecial(b&0xF); return;  // Divide //
                case 0x6E: this.success = true;
                    if(!this.pop2AndPushIntResult(this.stackInteger(1) & this.stackInteger(0))) this.sendSpecial(b&0xF); return; // bitAnd:
                case 0x6F: this.success = true;
                    if(!this.pop2AndPushIntResult(this.stackInteger(1) | this.stackInteger(0))) this.sendSpecial(b&0xF); return; // bitOr:

                // at:, at:put:, size, next, nextPut:, ...
                case 0x70: case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: case 0x77:
                case 0x78: case 0x79: case 0x7A: case 0x7B: case 0x7C: case 0x7D: case 0x7E: case 0x7F:
                    if (!this.primHandler.quickSendOther(this.receiver, b&0xF))
                        this.sendSpecial((b&0xF)+16); return;

                // Send Literal Selector with 0, 1, and 2 args
                case 0x80: case 0x81: case 0x82: case 0x83: case 0x84: case 0x85: case 0x86: case 0x87:
                case 0x88: case 0x89: case 0x8A: case 0x8B: case 0x8C: case 0x8D: case 0x8E: case 0x8F:
                    this.send(this.method.methodGetSelector(b&0xF), 0, false); return;
                case 0x90: case 0x91: case 0x92: case 0x93: case 0x94: case 0x95: case 0x96: case 0x97:
                case 0x98: case 0x99: case 0x9A: case 0x9B: case 0x9C: case 0x9D: case 0x9E: case 0x9F:
                    this.send(this.method.methodGetSelector(b&0xF), 1, false); return;
                case 0xA0: case 0xA1: case 0xA2: case 0xA3: case 0xA4: case 0xA5: case 0xA6: case 0xA7:
                case 0xA8: case 0xA9: case 0xAA: case 0xAB: case 0xAC: case 0xAD: case 0xAE: case 0xAF:
                    this.send(this.method.methodGetSelector(b&0xF), 2, false); return;

                // Short jmp
                case 0xB0: case 0xB1: case 0xB2: case 0xB3: case 0xB4: case 0xB5: case 0xB6: case 0xB7:
                    this.pc += (b&7)+1; return;
                // Short conditional jump on true
                case 0xB8: case 0xB9: case 0xBA: case 0xBB: case 0xBC: case 0xBD: case 0xBE: case 0xBF:
                    this.jumpIfTrue((b&7)+1); return;
                // Short conditional jump on false
                case 0xC0: case 0xC1: case 0xC2: case 0xC3: case 0xC4: case 0xC5: case 0xC6: case 0xC7:
                    this.jumpIfFalse((b&7)+1); return;

                // storeAndPop rcvr, temp
                case 0xC8: case 0xC9: case 0xCA: case 0xCB: case 0xCC: case 0xCD: case 0xCE: case 0xCF:
                    this.receiver.dirty = true;
                    this.receiver.pointers[b&7] = this.pop(); return;
                case 0xD0: case 0xD1: case 0xD2: case 0xD3: case 0xD4: case 0xD5: case 0xD6: case 0xD7:
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+(b&7)] = this.pop(); return;

                case 0xD8: this.pop(); return;  // pop
                case 0xD9: this.nono(); return; // FIXME: Unconditional trap
                case 0xDA: case 0xDB: case 0xDC: case 0xDD: case 0xDE: case 0xDF:
                    this.nono(); return; // unused

                // 2 Byte Bytecodes

                case 0xE0:
                    b2 = this.nextByte(); this.interpretOneSistaWithExtensions(singleStep, (extA << 8) + b2, extB); return;
                case 0xE1:
                    b2 = this.nextByte(); this.interpretOneSistaWithExtensions(singleStep, extA, (extB << 8) + (b2 < 128 ? b2 : b2-256)); return;
                case 0xE2:
                    b2 = this.nextByte(); this.push(this.receiver.pointers[b2 + (extA << 8)]); return;
                case 0xE3:
                    b2 = this.nextByte(); this.push((this.method.methodGetLiteral(b2 + (extA << 8))).pointers[Squeak.Assn_value]); return;
                case 0xE4:
                    b2 = this.nextByte(); this.push(this.method.methodGetLiteral(b2 + (extA << 8))); return;
                case 0xE5:
                    b2 = this.nextByte(); this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+b2]); return;
                case 0xE6: this.nono(); return; // unused
                case 0xE7: this.pushNewArray(this.nextByte()); return; // create new temp vector
                case 0xE8: b2 = this.nextByte(); this.push(b2 + (extB << 8)); return; // push SmallInteger
                case 0xE9: b2 = this.nextByte(); this.push(this.image.getCharacter(b2 + (extB << 8))); return; // push Character
                case 0xEA:
                    b2 = this.nextByte();
                    this.send(this.method.methodGetSelector((b2 >> 3) + (extA << 5)), (b2 & 7) + (extB << 3), false); return;
                case 0xEB:
                    b2 = this.nextByte();
                    var literal = this.method.methodGetSelector((b2 >> 3) + (extA << 5));
                    if (extB >= 64) {
                        this.sendSuperDirected(literal, (b2 & 7) + ((extB & 63) << 3)); return;
                    } else {
                        this.send(literal, (b2 & 7) + (extB << 3), true); return;
                    }
                case 0xEC: this.nono(); return; // unused
                case 0xED: // long jump, forward and back
                    var offset = this.nextByte() + (extB << 8);
                    this.pc += offset;
                    if (offset < 0)        // check for process switch on backward jumps (loops)
                        if (this.interruptCheckCounter-- <= 0) this.checkForInterrupts();
                    return;
                case 0xEE: // long conditional jump on true
                    this.jumpIfTrue(this.nextByte() + (extB << 8)); return;
                case 0xEF: // long conditional jump on false
                    this.jumpIfFalse(this.nextByte() + (extB << 8)); return;
                case 0xF0: // pop into receiver
                    this.receiver.dirty = true;
                    this.receiver.pointers[this.nextByte() + (extA << 8)] = this.pop();
                    return;
                case 0xF1: // pop into literal
                    var assoc = this.method.methodGetLiteral(this.nextByte() + (extA << 8));
                    assoc.dirty = true;
                    assoc.pointers[Squeak.Assn_value] = this.pop();
                    return;
                case 0xF2: // pop into temp
                    this.homeContext.pointers[Squeak.Context_tempFrameStart + this.nextByte()] = this.pop();
                    return;
                case 0xF3: // store into receiver
                    this.receiver.dirty = true;
                    this.receiver.pointers[this.nextByte() + (extA << 8)] = this.top();
                    return;
                case 0xF4: // store into literal
                    var assoc = this.method.methodGetLiteral(this.nextByte() + (extA << 8));
                    assoc.dirty = true;
                    assoc.pointers[Squeak.Assn_value] = this.top();
                    return;
                case 0xF5: // store into temp
                    this.homeContext.pointers[Squeak.Context_tempFrameStart + this.nextByte()] = this.top();
                    return;
                case 0xF6: case 0xF7: this.nono(); return; // unused

                // 3 Byte Bytecodes

                case 0xF8: this.callPrimBytecode(0xF5); return;
                case 0xF9: this.pushFullClosure(extA); return;
                case 0xFA: this.pushClosureCopyExtended(extA, extB); return;
                case 0xFB: b2 = this.nextByte(); // remote push from temp vector
                    this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+this.nextByte()].pointers[b2]);
                    return;
                case 0xFC: b2 = this.nextByte(); // remote store into temp vector
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+this.nextByte()].pointers[b2] = this.top();
                    return;
                case 0xFD: b2 = this.nextByte(); // remote store and pop into temp vector
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+this.nextByte()].pointers[b2] = this.pop();
                    return;
                case 0xFE: case 0xFF: this.nono(); return; // unused
            }
            throw Error("not a bytecode: " + b);
        },
        interpret: function(forMilliseconds, thenDo) {
            // run for a couple milliseconds (but only until idle or break)
            // answer milliseconds to sleep (until next timer wakeup)
            // or 'break' if reached breakpoint
            // call thenDo with that result when done
            if (this.frozen) return 'frozen';
            this.isIdle = false;
            this.breakOutOfInterpreter = false;
            this.breakOutTick = this.primHandler.millisecondClockValue() + (forMilliseconds || 500);
            while (this.breakOutOfInterpreter === false)
                if (this.method.compiled) {
                    this.method.compiled(this);
                } else {
                    this.interpretOne();
                }
            // this is to allow 'freezing' the interpreter and restarting it asynchronously. See freeze()
            if (typeof this.breakOutOfInterpreter == "function")
                return this.breakOutOfInterpreter(thenDo);
            // normally, we answer regularly
            var result = this.breakOutOfInterpreter == 'break' ? 'break'
                : !this.isIdle ? 0
                : !this.nextWakeupTick ? 'sleep'        // all processes waiting
                : Math.max(1, this.nextWakeupTick - this.primHandler.millisecondClockValue());
            if (thenDo) thenDo(result);
            return result;
        },
        goIdle: function() {
            // make sure we tend to pending delays
            var hadTimer = this.nextWakeupTick !== 0;
            this.forceInterruptCheck();
            this.checkForInterrupts();
            var hasTimer = this.nextWakeupTick !== 0;
            // go idle unless a timer just expired
            this.isIdle = hasTimer || !hadTimer;
            this.breakOut();
        },
        freeze: function(frozenDo) {
            // Stop the interpreter. Answer a function that can be
            // called to continue interpreting.
            // Optionally, frozenDo is called asynchronously when frozen
            var continueFunc;
            this.frozen = true;
            this.breakOutOfInterpreter = function(thenDo) {
                if (!thenDo) throw Error("need function to restart interpreter");
                continueFunc = thenDo;
                return "frozen";
            }.bind(this);
            var unfreeze = function() {
                this.frozen = false;
                if (!continueFunc) throw Error("no continue function");
                continueFunc(0);    //continue without timeout
            }.bind(this);
            if (frozenDo) self.setTimeout(function(){frozenDo(unfreeze);}, 0);
            return unfreeze;
        },
        breakOut: function() {
            this.breakOutOfInterpreter = this.breakOutOfInterpreter || true; // do not overwrite break string
        },
        nextByte: function() {
            return this.method.bytes[this.pc++];
        },
        nono: function() {
            throw Error("Oh No!");
        },
        forceInterruptCheck: function() {
            this.interruptCheckCounter = -1000;
        },
        checkForInterrupts: function() {
            //Check for interrupts at sends and backward jumps
            var now = this.primHandler.millisecondClockValue();
            if (now < this.lastTick) { // millisecond clock wrapped
                this.nextPollTick = now + (this.nextPollTick - this.lastTick);
                this.breakOutTick = now + (this.breakOutTick - this.lastTick);
                if (this.nextWakeupTick !== 0)
                    this.nextWakeupTick = now + (this.nextWakeupTick - this.lastTick);
            }
            //Feedback logic attempts to keep interrupt response around 3ms...
            if (this.interruptCheckCounter > -100) { // only if not a forced check
                if ((now - this.lastTick) < this.interruptChecksEveryNms) { //wrapping is not a concern
                    this.interruptCheckCounterFeedBackReset += 10;
                } else { // do a thousand sends even if we are too slow for 3ms
                    if (this.interruptCheckCounterFeedBackReset <= 1000)
                        this.interruptCheckCounterFeedBackReset = 1000;
                    else
                        this.interruptCheckCounterFeedBackReset -= 12;
                }
            }
            this.interruptCheckCounter = this.interruptCheckCounterFeedBackReset; //reset the interrupt check counter
            this.lastTick = now; //used to detect wraparound of millisecond clock
            //  if(signalLowSpace) {
            //            signalLowSpace= false; //reset flag
            //            sema= getSpecialObject(Squeak.splOb_TheLowSpaceSemaphore);
            //            if(sema != nilObj) synchronousSignal(sema); }
            //  if(now >= nextPollTick) {
            //            ioProcessEvents(); //sets interruptPending if interrupt key pressed
            //            nextPollTick= now + 500; } //msecs to wait before next call to ioProcessEvents"
            if (this.interruptPending) {
                this.interruptPending = false; //reset interrupt flag
                var sema = this.specialObjects[Squeak.splOb_TheInterruptSemaphore];
                if (!sema.isNil) this.primHandler.synchronousSignal(sema);
            }
            if ((this.nextWakeupTick !== 0) && (now >= this.nextWakeupTick)) {
                this.nextWakeupTick = 0; //reset timer interrupt
                var sema = this.specialObjects[Squeak.splOb_TheTimerSemaphore];
                if (!sema.isNil) this.primHandler.synchronousSignal(sema);
            }
            if (this.pendingFinalizationSignals > 0) { //signal any pending finalizations
                var sema = this.specialObjects[Squeak.splOb_TheFinalizationSemaphore];
                this.pendingFinalizationSignals = 0;
                if (!sema.isNil) this.primHandler.synchronousSignal(sema);
            }
            if (this.primHandler.semaphoresToSignal.length > 0)
                this.primHandler.signalExternalSemaphores();  // signal pending semaphores, if any
            // if this is a long-running do-it, compile it
            if (!this.method.compiled && this.compiler)
                this.compiler.compile(this.method);
            // have to return to web browser once in a while
            if (now >= this.breakOutTick)
                this.breakOut();
        },
        extendedPush: function(nextByte) {
            var lobits = nextByte & 63;
            switch (nextByte>>6) {
                case 0: this.push(this.receiver.pointers[lobits]);break;
                case 1: this.push(this.homeContext.pointers[Squeak.Context_tempFrameStart+lobits]); break;
                case 2: this.push(this.method.methodGetLiteral(lobits)); break;
                case 3: this.push(this.method.methodGetLiteral(lobits).pointers[Squeak.Assn_value]); break;
            }
        },
        extendedStore: function( nextByte) {
            var lobits = nextByte & 63;
            switch (nextByte>>6) {
                case 0:
                    this.receiver.dirty = true;
                    this.receiver.pointers[lobits] = this.top();
                    break;
                case 1:
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+lobits] = this.top();
                    break;
                case 2:
                    this.nono();
                    break;
                case 3:
                    var assoc = this.method.methodGetLiteral(lobits);
                    assoc.dirty = true;
                    assoc.pointers[Squeak.Assn_value] = this.top();
                    break;
            }
        },
        extendedStorePop: function(nextByte) {
            var lobits = nextByte & 63;
            switch (nextByte>>6) {
                case 0:
                    this.receiver.dirty = true;
                    this.receiver.pointers[lobits] = this.pop();
                    break;
                case 1:
                    this.homeContext.pointers[Squeak.Context_tempFrameStart+lobits] = this.pop();
                    break;
                case 2:
                    this.nono();
                    break;
                case 3:
                    var assoc = this.method.methodGetLiteral(lobits);
                    assoc.dirty = true;
                    assoc.pointers[Squeak.Assn_value] = this.pop();
                    break;
            }
        },
        doubleExtendedDoAnything: function(byte2) {
            var byte3 = this.nextByte();
            switch (byte2>>5) {
                case 0: this.send(this.method.methodGetSelector(byte3), byte2&31, false); break;
                case 1: this.send(this.method.methodGetSelector(byte3), byte2&31, true); break;
                case 2: this.push(this.receiver.pointers[byte3]); break;
                case 3: this.push(this.method.methodGetLiteral(byte3)); break;
                case 4: this.push(this.method.methodGetLiteral(byte3).pointers[Squeak.Assn_value]); break;
                case 5: this.receiver.dirty = true; this.receiver.pointers[byte3] = this.top(); break;
                case 6: this.receiver.dirty = true; this.receiver.pointers[byte3] = this.pop(); break;
                case 7: var assoc = this.method.methodGetLiteral(byte3);
                    assoc.dirty = true;
                    assoc.pointers[Squeak.Assn_value] = this.top(); break;
            }
        },
        jumpIfTrue: function(delta) {
            var top = this.pop();
            if (top.isTrue) {this.pc += delta; return;}
            if (top.isFalse) return;
            this.push(top); //Uh-oh it's not even a boolean (that we know of ;-).  Restore stack...
            this.send(this.specialObjects[Squeak.splOb_SelectorMustBeBoolean], 0, false);
        },
        jumpIfFalse: function(delta) {
            var top = this.pop();
            if (top.isFalse) {this.pc += delta; return;}
            if (top.isTrue) return;
            this.push(top); //Uh-oh it's not even a boolean (that we know of ;-).  Restore stack...
            this.send(this.specialObjects[Squeak.splOb_SelectorMustBeBoolean], 0, false);
        },
        sendSpecial: function(lobits) {
            this.send(this.specialSelectors[lobits*2],
                this.specialSelectors[(lobits*2)+1],
                false);  //specialSelectors is  {...sel,nArgs,sel,nArgs,...)
        },
        callPrimBytecode: function(extendedStoreBytecode) {
            this.pc += 2; // skip over primitive number
            if (this.primFailCode) {
                if (this.method.bytes[this.pc] === extendedStoreBytecode)
                    this.stackTopPut(this.getErrorObjectFromPrimFailCode());
                this.primFailCode = 0;
            }
        },
        getErrorObjectFromPrimFailCode: function() {
            var primErrTable = this.specialObjects[Squeak.splOb_PrimErrTableIndex];
            if (primErrTable && primErrTable.pointers) {
                var errorObject = primErrTable.pointers[this.primFailCode - 1];
                if (errorObject) return errorObject;
            }
            return this.primFailCode;
        },
    },
    'closures', {
        pushNewArray: function(nextByte) {
            var popValues = nextByte > 127,
                count = nextByte & 127,
                array = this.instantiateClass(this.specialObjects[Squeak.splOb_ClassArray], count);
            if (popValues) {
                for (var i = 0; i < count; i++)
                    array.pointers[i] = this.stackValue(count - i - 1);
                this.popN(count);
            }
            this.push(array);
        },
        pushClosureCopy: function() {
            // The compiler has pushed the values to be copied, if any.  Find numArgs and numCopied in the byte following.
            // Create a Closure with space for the copiedValues and pop numCopied values off the stack into the closure.
            // Set numArgs as specified, and set startpc to the pc following the block size and jump over that code.
            var numArgsNumCopied = this.nextByte(),
                numArgs = numArgsNumCopied & 0xF,
                numCopied = numArgsNumCopied >> 4,
                blockSizeHigh = this.nextByte(),
                blockSize = blockSizeHigh * 256 + this.nextByte(),
                initialPC = this.encodeSqueakPC(this.pc, this.method),
                closure = this.newClosure(numArgs, initialPC, numCopied);
            closure.pointers[Squeak.Closure_outerContext] = this.activeContext;
            this.reclaimableContextCount = 0; // The closure refers to thisContext so it can't be reclaimed
            if (numCopied > 0) {
                for (var i = 0; i < numCopied; i++)
                    closure.pointers[Squeak.Closure_firstCopiedValue + i] = this.stackValue(numCopied - i - 1);
                this.popN(numCopied);
            }
            this.pc += blockSize;
            this.push(closure);
        },
        pushClosureCopyExtended: function(extA, extB) {
            var byteA = this.nextByte();
            var byteB = this.nextByte();
            var numArgs = (byteA & 7) + this.mod(extA, 16) * 8,
                numCopied = (byteA >> 3 & 0x7) + this.div(extA, 16) * 8,
                blockSize = byteB + (extB << 8),
                initialPC = this.encodeSqueakPC(this.pc, this.method),
                closure = this.newClosure(numArgs, initialPC, numCopied);
            closure.pointers[Squeak.Closure_outerContext] = this.activeContext;
            this.reclaimableContextCount = 0; // The closure refers to thisContext so it can't be reclaimed
            if (numCopied > 0) {
                for (var i = 0; i < numCopied; i++)
                    closure.pointers[Squeak.Closure_firstCopiedValue + i] = this.stackValue(numCopied - i - 1);
                this.popN(numCopied);
            }
            this.pc += blockSize;
            this.push(closure);
        },
        pushFullClosure: function(extA) {
            var byteA = this.nextByte();
            var byteB = this.nextByte();
            var literalIndex = byteA + (extA << 8);
            var numCopied = byteB & 63;
            var context;
            if ((byteB >> 6 & 1) == 1) {
                context = this.vm.nilObj;
            } else {
                context = this.activeContext;
            }
            var compiledBlock = this.method.methodGetLiteral(literalIndex);
            var closure = this.newFullClosure(context, numCopied, compiledBlock);
            if ((byteB >> 7 & 1) == 1) {
                throw Error("on-stack receiver not yet supported");
            } else {
                closure.pointers[Squeak.ClosureFull_receiver] = this.receiver;
            }
            this.reclaimableContextCount = 0; // The closure refers to thisContext so it can't be reclaimed
            if (numCopied > 0) {
                for (var i = 0; i < numCopied; i++)
                    closure.pointers[Squeak.ClosureFull_firstCopiedValue + i] = this.stackValue(numCopied - i - 1);
                this.popN(numCopied);
            }
            this.push(closure);
        },
        newClosure: function(numArgs, initialPC, numCopied) {
            var closure = this.instantiateClass(this.specialObjects[Squeak.splOb_ClassBlockClosure], numCopied);
            closure.pointers[Squeak.Closure_startpc] = initialPC;
            closure.pointers[Squeak.Closure_numArgs] = numArgs;
            return closure;
        },
        newFullClosure: function(context, numCopied, compiledBlock) {
            var closure = this.instantiateClass(this.specialObjects[Squeak.splOb_ClassFullBlockClosure], numCopied);
            closure.pointers[Squeak.Closure_outerContext] = context;
            closure.pointers[Squeak.ClosureFull_method] = compiledBlock;
            closure.pointers[Squeak.Closure_numArgs] = compiledBlock.methodNumArgs();
            return closure;
        },
    },
    'sending', {
        send: function(selector, argCount, doSuper) {
            var newRcvr = this.stackValue(argCount);
            var lookupClass;
            if (doSuper) {
                lookupClass = this.method.methodClassForSuper();
                lookupClass = lookupClass.pointers[Squeak.Class_superclass];
            } else {
                lookupClass = this.getClass(newRcvr);
            }
            var entry = this.findSelectorInClass(selector, argCount, lookupClass);
            if (entry.primIndex) {
                //note details for verification of at/atput primitives
                this.verifyAtSelector = selector;
                this.verifyAtClass = lookupClass;
            }
            this.executeNewMethod(newRcvr, entry.method, entry.argCount, entry.primIndex, entry.mClass, selector);
        },
        sendSuperDirected: function(selector, argCount) {
            var lookupClass = this.pop().pointers[Squeak.Class_superclass];
            var newRcvr = this.stackValue(argCount);
            var entry = this.findSelectorInClass(selector, argCount, lookupClass);
            if (entry.primIndex) {
                //note details for verification of at/atput primitives
                this.verifyAtSelector = selector;
                this.verifyAtClass = lookupClass;
            }
            this.executeNewMethod(newRcvr, entry.method, entry.argCount, entry.primIndex, entry.mClass, selector);
        },
        sendAsPrimitiveFailure: function(rcvr, method, argCount) {
            this.executeNewMethod(rcvr, method, argCount, 0);
        },
        findSelectorInClass: function(selector, argCount, startingClass) {
            this.currentSelector = selector; // for primitiveInvokeObjectAsMethod
            var cacheEntry = this.findMethodCacheEntry(selector, startingClass);
            if (cacheEntry.method) return cacheEntry; // Found it in the method cache
            var currentClass = startingClass;
            var mDict;
            while (!currentClass.isNil) {
                mDict = currentClass.pointers[Squeak.Class_mdict];
                if (mDict.isNil) {
                    // MethodDict pointer is nil (hopefully due a swapped out stub)
                    //        -- send #cannotInterpret:
                    var cantInterpSel = this.specialObjects[Squeak.splOb_SelectorCannotInterpret],
                        cantInterpMsg = this.createActualMessage(selector, argCount, startingClass);
                    this.popNandPush(argCount, cantInterpMsg);
                    return this.findSelectorInClass(cantInterpSel, 1, currentClass.superclass());
                }
                var newMethod = this.lookupSelectorInDict(mDict, selector);
                if (!newMethod.isNil) {
                    // if method is not actually a CompiledMethod, let primitiveInvokeObjectAsMethod (576) handle it
                    cacheEntry.method = newMethod;
                    cacheEntry.primIndex = newMethod.isMethod() ? newMethod.methodPrimitiveIndex() : 576;
                    cacheEntry.argCount = argCount;
                    cacheEntry.mClass = currentClass;
                    return cacheEntry;
                }
                currentClass = currentClass.superclass();
            }
            //Cound not find a normal message -- send #doesNotUnderstand:
            var dnuSel = this.specialObjects[Squeak.splOb_SelectorDoesNotUnderstand];
            if (selector === dnuSel) // Cannot find #doesNotUnderstand: -- unrecoverable error.
                throw Error("Recursive not understood error encountered");
            var dnuMsg = this.createActualMessage(selector, argCount, startingClass); //The argument to doesNotUnderstand:
            this.popNandPush(argCount, dnuMsg);
            return this.findSelectorInClass(dnuSel, 1, startingClass);
        },
        lookupSelectorInDict: function(mDict, messageSelector) {
            //Returns a method or nilObject
            var dictSize = mDict.pointersSize();
            var mask = (dictSize - Squeak.MethodDict_selectorStart) - 1;
            var index = (mask & messageSelector.hash) + Squeak.MethodDict_selectorStart;
            // If there are no nils (should always be), then stop looping on second wrap.
            var hasWrapped = false;
            while (true) {
                var nextSelector = mDict.pointers[index];
                if (nextSelector === messageSelector) {
                    var methArray = mDict.pointers[Squeak.MethodDict_array];
                    return methArray.pointers[index - Squeak.MethodDict_selectorStart];
                }
                if (nextSelector.isNil) return this.nilObj;
                if (++index === dictSize) {
                    if (hasWrapped) return this.nilObj;
                    index = Squeak.MethodDict_selectorStart;
                    hasWrapped = true;
                }
            }
        },
        executeNewMethod: function(newRcvr, newMethod, argumentCount, primitiveIndex, optClass, optSel) {
            this.sendCount++;
            if (newMethod === this.breakOnMethod) this.breakNow("executing method " + this.printMethod(newMethod, optClass, optSel));
            if (this.logSends) console.log(this.sendCount + ' ' + this.printMethod(newMethod, optClass, optSel));
            if (this.breakOnContextChanged) {
                this.breakOnContextChanged = false;
                this.breakNow();
            }
            if (primitiveIndex > 0)
                if (this.tryPrimitive(primitiveIndex, argumentCount, newMethod))
                    return;  //Primitive succeeded -- end of story
            var newContext = this.allocateOrRecycleContext(newMethod.methodNeedsLargeFrame());
            var tempCount = newMethod.methodTempCount();
            var newPC = 0; // direct zero-based index into byte codes
            var newSP = Squeak.Context_tempFrameStart + tempCount - 1; // direct zero-based index into context pointers
            newContext.pointers[Squeak.Context_method] = newMethod;
            //Following store is in case we alloc without init; all other fields get stored
            newContext.pointers[Squeak.BlockContext_initialIP] = this.nilObj;
            newContext.pointers[Squeak.Context_sender] = this.activeContext;
            //Copy receiver and args to new context
            //Note this statement relies on the receiver slot being contiguous with args...
            this.arrayCopy(this.activeContext.pointers, this.sp-argumentCount, newContext.pointers, Squeak.Context_tempFrameStart-1, argumentCount+1);
            //...and fill the remaining temps with nil
            this.arrayFill(newContext.pointers, Squeak.Context_tempFrameStart+argumentCount, Squeak.Context_tempFrameStart+tempCount, this.nilObj);
            this.popN(argumentCount+1);
            this.reclaimableContextCount++;
            this.storeContextRegisters();
            /////// Woosh //////
            this.activeContext = newContext; //We're off and running...
            //Following are more efficient than fetchContextRegisters() in newActiveContext()
            this.activeContext.dirty = true;
            this.homeContext = newContext;
            this.method = newMethod;
            this.pc = newPC;
            this.sp = newSP;
            this.receiver = newContext.pointers[Squeak.Context_receiver];
            if (this.receiver !== newRcvr)
                throw Error("receivers don't match");
            if (!newMethod.compiled && this.compiler)
                this.compiler.compile(newMethod, optClass, optSel);
            // check for process switch on full method activation
            if (this.interruptCheckCounter-- <= 0) this.checkForInterrupts();
        },
        doReturn: function(returnValue, targetContext) {
            // get sender from block home or closure's outerContext
            if (!targetContext) {
                var ctx = this.homeContext;
                if (this.hasClosures) {
                    var closure;
                    while (!(closure = ctx.pointers[Squeak.Context_closure]).isNil)
                        ctx = closure.pointers[Squeak.Closure_outerContext];
                }
                targetContext = ctx.pointers[Squeak.Context_sender];
            }
            if (targetContext.isNil || targetContext.pointers[Squeak.Context_instructionPointer].isNil)
                return this.cannotReturn(returnValue);
            // search up stack for unwind
            var thisContext = this.activeContext.pointers[Squeak.Context_sender];
            while (thisContext !== targetContext) {
                if (thisContext.isNil)
                    return this.cannotReturn(returnValue);
                if (this.isUnwindMarked(thisContext))
                    return this.aboutToReturnThrough(returnValue, thisContext);
                thisContext = thisContext.pointers[Squeak.Context_sender];
            }
            // no unwind to worry about, just peel back the stack (usually just to sender)
            var nextContext;
            thisContext = this.activeContext;
            while (thisContext !== targetContext) {
                if (this.breakOnContextReturned === thisContext) {
                    this.breakOnContextReturned = null;
                    this.breakNow();
                }
                nextContext = thisContext.pointers[Squeak.Context_sender];
                thisContext.pointers[Squeak.Context_sender] = this.nilObj;
                thisContext.pointers[Squeak.Context_instructionPointer] = this.nilObj;
                if (this.reclaimableContextCount > 0) {
                    this.reclaimableContextCount--;
                    this.recycleIfPossible(thisContext);
                }
                thisContext = nextContext;
            }
            this.activeContext = thisContext;
            this.activeContext.dirty = true;
            this.fetchContextRegisters(this.activeContext);
            this.push(returnValue);
            if (this.breakOnContextChanged) {
                this.breakOnContextChanged = false;
                this.breakNow();
            }
        },
        aboutToReturnThrough: function(resultObj, aContext) {
            this.push(this.exportThisContext());
            this.push(resultObj);
            this.push(aContext);
            var aboutToReturnSel = this.specialObjects[Squeak.splOb_SelectorAboutToReturn];
            this.send(aboutToReturnSel, 2);
        },
        cannotReturn: function(resultObj) {
            this.push(this.exportThisContext());
            this.push(resultObj);
            var cannotReturnSel = this.specialObjects[Squeak.splOb_SelectorCannotReturn];
            this.send(cannotReturnSel, 1);
        },
        tryPrimitive: function(primIndex, argCount, newMethod) {
            if ((primIndex > 255) && (primIndex < 520)) {
                if (primIndex >= 264) {//return instvars
                    this.popNandPush(1, this.top().pointers[primIndex - 264]);
                    return true;
                }
                switch (primIndex) {
                    case 256: //return self
                        return true;
                    case 257: this.popNandPush(1, this.trueObj); //return true
                        return true;
                    case 258: this.popNandPush(1, this.falseObj); //return false
                        return true;
                    case 259: this.popNandPush(1, this.nilObj); //return nil
                        return true;
                }
                this.popNandPush(1, primIndex - 261); //return -1...2
                return true;
            }
            var sp = this.sp;
            var context = this.activeContext;
            var success = this.primHandler.doPrimitive(primIndex, argCount, newMethod);
            if (success
                && this.sp !== sp - argCount
                && context === this.activeContext
                && primIndex !== 117    // named prims are checked separately
                && !this.frozen) {
                    this.warnOnce("stack unbalanced after primitive " + primIndex, "error");
                }
            return success;
        },
        createActualMessage: function(selector, argCount, cls) {
            //Bundle up receiver, args and selector as a messageObject
            var message = this.instantiateClass(this.specialObjects[Squeak.splOb_ClassMessage], 0);
            var argArray = this.instantiateClass(this.specialObjects[Squeak.splOb_ClassArray], argCount);
            this.arrayCopy(this.activeContext.pointers, this.sp-argCount+1, argArray.pointers, 0, argCount); //copy args from stack
            message.pointers[Squeak.Message_selector] = selector;
            message.pointers[Squeak.Message_arguments] = argArray;
            if (message.pointers.length > Squeak.Message_lookupClass) //Early versions don't have lookupClass
                message.pointers[Squeak.Message_lookupClass] = cls;
            return message;
        },
        primitivePerform: function(argCount) {
            var selector = this.stackValue(argCount-1);
            var rcvr = this.stackValue(argCount);
            // NOTE: findNewMethodInClass may fail and be converted to #doesNotUnderstand:,
            //       (Whoah) so we must slide args down on the stack now, so that would work
            var trueArgCount = argCount - 1;
            var selectorIndex = this.sp - trueArgCount;
            var stack = this.activeContext.pointers; // slide eveything down...
            this.arrayCopy(stack, selectorIndex+1, stack, selectorIndex, trueArgCount);
            this.sp--; // adjust sp accordingly
            var entry = this.findSelectorInClass(selector, trueArgCount, this.getClass(rcvr));
            this.executeNewMethod(rcvr, entry.method, entry.argCount, entry.primIndex, entry.mClass, selector);
            return true;
        },
        primitivePerformWithArgs: function(argCount, supered) {
            var rcvrPos = supered ? 3 : 2;
            var rcvr = this.stackValue(rcvrPos);
            var selector = this.stackValue(rcvrPos - 1);
            var args = this.stackValue(rcvrPos - 2);
            if (args.sqClass !== this.specialObjects[Squeak.splOb_ClassArray])
                return false;
            var lookupClass = supered ? this.top() : this.getClass(rcvr);
            if (supered) { // verify that lookupClass is in fact in superclass chain of receiver;
                var cls = this.getClass(rcvr);
                while (cls !== lookupClass) {
                    cls = cls.pointers[Squeak.Class_superclass];
                    if (cls.isNil) return false;
                }
            }
            var trueArgCount = args.pointersSize();
            var selectorIndex = this.sp - (rcvrPos - 1);
            var stack = this.activeContext.pointers;
            this.arrayCopy(args.pointers, 0, stack, selectorIndex, trueArgCount);
            this.sp += trueArgCount - argCount; //pop selector and array then push args
            var entry = this.findSelectorInClass(selector, trueArgCount, lookupClass);
            this.executeNewMethod(rcvr, entry.method, entry.argCount, entry.primIndex, entry.mClass, selector);
            return true;
        },
        primitiveInvokeObjectAsMethod: function(argCount, method) {
            // invoked from VM if non-method found in lookup
            var orgArgs = this.instantiateClass(this.specialObjects[Squeak.splOb_ClassArray], argCount);
            for (var i = 0; i < argCount; i++)
                orgArgs.pointers[argCount - i - 1] = this.pop();
            var orgReceiver = this.pop(),
                orgSelector = this.currentSelector;
            // send run:with:in: to non-method object
            var runWithIn = this.specialObjects[Squeak.splOb_SelectorRunWithIn];
            this.push(method);       // not actually a method
            this.push(orgSelector);
            this.push(orgArgs);
            this.push(orgReceiver);
            this.send(runWithIn, 3, false);
            return true;
        },
        findMethodCacheEntry: function(selector, lkupClass) {
            //Probe the cache, and return the matching entry if found
            //Otherwise return one that can be used (selector and class set) with method == null.
            //Initial probe is class xor selector, reprobe delta is selector
            //We do not try to optimize probe time -- all are equally 'fast' compared to lookup
            //Instead we randomize the reprobe so two or three very active conflicting entries
            //will not keep dislodging each other
            var entry;
            this.methodCacheRandomish = (this.methodCacheRandomish + 1) & 3;
            var firstProbe = (selector.hash ^ lkupClass.hash) & this.methodCacheMask;
            var probe = firstProbe;
            for (var i = 0; i < 4; i++) { // 4 reprobes for now
                entry = this.methodCache[probe];
                if (entry.selector === selector && entry.lkupClass === lkupClass) return entry;
                if (i === this.methodCacheRandomish) firstProbe = probe;
                probe = (probe + selector.hash) & this.methodCacheMask;
            }
            entry = this.methodCache[firstProbe];
            entry.lkupClass = lkupClass;
            entry.selector = selector;
            entry.method = null;
            return entry;
        },
        flushMethodCache: function() { //clear all cache entries (prim 89)
            for (var i = 0; i < this.methodCacheSize; i++) {
                this.methodCache[i].selector = null;   // mark it free
                this.methodCache[i].method = null;  // release the method
            }
            return true;
        },
        flushMethodCacheForSelector: function(selector) { //clear cache entries for selector (prim 119)
            for (var i = 0; i < this.methodCacheSize; i++)
                if (this.methodCache[i].selector === selector) {
                    this.methodCache[i].selector = null;   // mark it free
                    this.methodCache[i].method = null;  // release the method
                }
            return true;
        },
        flushMethodCacheForMethod: function(method) { //clear cache entries for method (prim 116)
            for (var i = 0; i < this.methodCacheSize; i++)
                if (this.methodCache[i].method === method) {
                    this.methodCache[i].selector = null;   // mark it free
                    this.methodCache[i].method = null;  // release the method
                }
            return true;
        },
        flushMethodCacheAfterBecome: function(mutations) {
            // could be selective by checking lkupClass, selector,
            // and method against mutations dict
            this.flushMethodCache();
        },
    },
    'contexts', {
        isUnwindMarked: function(ctx) {
            if (!this.isMethodContext(ctx)) return false;
            var method = ctx.pointers[Squeak.Context_method];
            return method.methodPrimitiveIndex() == 198;
        },
        newActiveContext: function(newContext) {
            // Note: this is inlined in executeNewMethod() and doReturn()
            this.storeContextRegisters();
            this.activeContext = newContext; //We're off and running...
            this.activeContext.dirty = true;
            this.fetchContextRegisters(newContext);
            if (this.breakOnContextChanged) {
                this.breakOnContextChanged = false;
                this.breakNow();
            }
        },
        exportThisContext: function() {
            this.storeContextRegisters();
            this.reclaimableContextCount = 0;
            return this.activeContext;
        },
        fetchContextRegisters: function(ctxt) {
            var meth = ctxt.pointers[Squeak.Context_method];
            if (this.isSmallInt(meth)) { //if the Method field is an integer, activeCntx is a block context
                this.homeContext = ctxt.pointers[Squeak.BlockContext_home];
                meth = this.homeContext.pointers[Squeak.Context_method];
            } else { //otherwise home==ctxt
                this.homeContext = ctxt;
            }
            this.receiver = this.homeContext.pointers[Squeak.Context_receiver];
            this.method = meth;
            this.pc = this.decodeSqueakPC(ctxt.pointers[Squeak.Context_instructionPointer], meth);
            this.sp = this.decodeSqueakSP(ctxt.pointers[Squeak.Context_stackPointer]);
        },
        storeContextRegisters: function() {
            //Save pc, sp into activeContext object, prior to change of context
            //   see fetchContextRegisters for symmetry
            //   expects activeContext, pc, sp, and method state vars to still be valid
            this.activeContext.pointers[Squeak.Context_instructionPointer] = this.encodeSqueakPC(this.pc, this.method);
            this.activeContext.pointers[Squeak.Context_stackPointer] = this.encodeSqueakSP(this.sp);
        },
        encodeSqueakPC: function(intPC, method) {
            // Squeak pc is offset by header and literals
            // and 1 for z-rel addressing
            return intPC + method.pointers.length * 4 + 1;
        },
        decodeSqueakPC: function(squeakPC, method) {
            return squeakPC - method.pointers.length * 4 - 1;
        },
        encodeSqueakSP: function(intSP) {
            // sp is offset by tempFrameStart, -1 for z-rel addressing
            return intSP - (Squeak.Context_tempFrameStart - 1);
        },
        decodeSqueakSP: function(squeakSP) {
            return squeakSP + (Squeak.Context_tempFrameStart - 1);
        },
        recycleIfPossible: function(ctxt) {
            if (!this.isMethodContext(ctxt)) return;
            if (ctxt.pointersSize() === (Squeak.Context_tempFrameStart+Squeak.Context_smallFrameSize)) {
                // Recycle small contexts
                ctxt.pointers[0] = this.freeContexts;
                this.freeContexts = ctxt;
            } else { // Recycle large contexts
                if (ctxt.pointersSize() !== (Squeak.Context_tempFrameStart+Squeak.Context_largeFrameSize))
                    return;
                ctxt.pointers[0] = this.freeLargeContexts;
                this.freeLargeContexts = ctxt;
            }
        },
        allocateOrRecycleContext: function(needsLarge) {
            //Return a recycled context or a newly allocated one if none is available for recycling."
            var freebie;
            if (needsLarge) {
                if (!this.freeLargeContexts.isNil) {
                    freebie = this.freeLargeContexts;
                    this.freeLargeContexts = freebie.pointers[0];
                    this.nRecycledContexts++;
                    return freebie;
                }
                this.nAllocatedContexts++;
                return this.instantiateClass(this.specialObjects[Squeak.splOb_ClassMethodContext], Squeak.Context_largeFrameSize);
            } else {
                if (!this.freeContexts.isNil) {
                    freebie = this.freeContexts;
                    this.freeContexts = freebie.pointers[0];
                    this.nRecycledContexts++;
                    return freebie;
                }
                this.nAllocatedContexts++;
                return this.instantiateClass(this.specialObjects[Squeak.splOb_ClassMethodContext], Squeak.Context_smallFrameSize);
            }
        },
    },
    'stack access', {
        pop: function() {
            //Note leaves garbage above SP.  Cleaned out by fullGC.
            return this.activeContext.pointers[this.sp--];
        },
        popN: function(nToPop) {
            this.sp -= nToPop;
        },
        push: function(object) {
            this.activeContext.pointers[++this.sp] = object;
        },
        popNandPush: function(nToPop, object) {
            this.activeContext.pointers[this.sp -= nToPop - 1] = object;
        },
        top: function() {
            return this.activeContext.pointers[this.sp];
        },
        stackTopPut: function(object) {
            this.activeContext.pointers[this.sp] = object;
        },
        stackValue: function(depthIntoStack) {
            return this.activeContext.pointers[this.sp - depthIntoStack];
        },
        stackInteger: function(depthIntoStack) {
            return this.checkSmallInt(this.stackValue(depthIntoStack));
        },
        stackIntOrFloat: function(depthIntoStack) {
            var num = this.stackValue(depthIntoStack);
            // is it a SmallInt?
            if (typeof num === "number") return num;
            if (num === undefined) {this.success = false; return 0;}
            // is it a Float?
            if (num.isFloat) {
                this.resultIsFloat = true;   // need to return result as Float
                return num.float;
            }
            // maybe a 32-bit LargeInt?
            var bytes = num.bytes;
            if (bytes && bytes.length == 4) {
                var value = 0;
                for (var i = 3; i >= 0; i--)
                    value = value * 256 + bytes[i];
                if (num.sqClass === this.specialObjects[Squeak.splOb_ClassLargePositiveInteger])
                    return value;
                if (num.sqClass === this.specialObjects[Squeak.splOb_ClassLargeNegativeInteger])
                    return -value;
            }
            // none of the above
            this.success = false;
            return 0;
        },
        pop2AndPushIntResult: function(intResult) {// returns success boolean
            if (this.success && this.canBeSmallInt(intResult)) {
                this.popNandPush(2, intResult);
                return true;
            }
            return false;
        },
        pop2AndPushNumResult: function(numResult) {// returns success boolean
            if (this.success) {
                if (this.resultIsFloat) {
                    this.popNandPush(2, this.primHandler.makeFloat(numResult));
                    return true;
                }
                if (numResult >= Squeak.MinSmallInt && numResult <= Squeak.MaxSmallInt) {
                    this.popNandPush(2, numResult);
                    return true;
                }
                if (numResult >= -0xFFFFFFFF && numResult <= 0xFFFFFFFF) {
                    var negative = numResult < 0,
                        unsigned = negative ? -numResult : numResult,
                        lgIntClass = negative ? Squeak.splOb_ClassLargeNegativeInteger : Squeak.splOb_ClassLargePositiveInteger,
                        lgIntObj = this.instantiateClass(this.specialObjects[lgIntClass], 4),
                        bytes = lgIntObj.bytes;
                    bytes[0] = unsigned     & 255;
                    bytes[1] = unsigned>>8  & 255;
                    bytes[2] = unsigned>>16 & 255;
                    bytes[3] = unsigned>>24 & 255;
                    this.popNandPush(2, lgIntObj);
                    return true;
                }
            }
            return false;
        },
        pop2AndPushBoolResult: function(boolResult) {
            if (!this.success) return false;
            this.popNandPush(2, boolResult ? this.trueObj : this.falseObj);
            return true;
        },
    },
    'numbers', {
        getClass: function(obj) {
            if (this.isSmallInt(obj))
                return this.specialObjects[Squeak.splOb_ClassInteger];
            return obj.sqClass;
        },
        canBeSmallInt: function(anInt) {
            return (anInt >= Squeak.MinSmallInt) && (anInt <= Squeak.MaxSmallInt);
        },
        isSmallInt: function(object) {
            return typeof object === "number";
        },
        checkSmallInt: function(maybeSmallInt) { // returns an int and sets success
            if (typeof maybeSmallInt === "number")
                return maybeSmallInt;
            this.success = false;
            return 1;
        },
        quickDivide: function(rcvr, arg) { // must only handle exact case
            if (arg === 0) return Squeak.NonSmallInt;  // fail if divide by zero
            var result = rcvr / arg | 0;
            if (result * arg === rcvr) return result;
            return Squeak.NonSmallInt;     // fail if result is not exact
        },
        div: function(rcvr, arg) {
            if (arg === 0) return Squeak.NonSmallInt;  // fail if divide by zero
            return Math.floor(rcvr/arg);
        },
        mod: function(rcvr, arg) {
            if (arg === 0) return Squeak.NonSmallInt;  // fail if divide by zero
            return rcvr - Math.floor(rcvr/arg) * arg;
        },
        safeShift: function(smallInt, shiftCount) {
             // JS shifts only up to 31 bits
            if (shiftCount < 0) {
                if (shiftCount < -31) return smallInt < 0 ? -1 : 0;
                return smallInt >> -shiftCount; // OK to lose bits shifting right
            }
            if (shiftCount > 31) return smallInt == 0 ? 0 : Squeak.NonSmallInt;
            // check for lost bits by seeing if computation is reversible
            var shifted = smallInt << shiftCount;
            if  ((shifted>>shiftCount) === smallInt) return shifted;
            return Squeak.NonSmallInt;  //non-small result will cause failure
        },
    },
    'utils',
    {
        isContext: function(obj) {//either block or methodContext
            if (obj.sqClass === this.specialObjects[Squeak.splOb_ClassMethodContext]) return true;
            if (obj.sqClass === this.specialObjects[Squeak.splOb_ClassBlockContext]) return true;
            return false;
        },
        isMethodContext: function(obj) {
            return obj.sqClass === this.specialObjects[Squeak.splOb_ClassMethodContext];
        },
        instantiateClass: function(aClass, indexableSize) {
            return this.image.instantiateClass(aClass, indexableSize, this.nilObj);
        },
        arrayFill: function(array, fromIndex, toIndex, value) {
            // assign value to range from fromIndex (inclusive) to toIndex (exclusive)
            for (var i = fromIndex; i < toIndex; i++)
                array[i] = value;
        },
        arrayCopy: function(src, srcPos, dest, destPos, length) {
            // copy length elements from src at srcPos to dest at destPos
            if (src === dest && srcPos < destPos)
                for (var i = length - 1; i >= 0; i--)
                    dest[destPos + i] = src[srcPos + i];
            else
                for (var i = 0; i < length; i++)
                    dest[destPos + i] = src[srcPos + i];
        },
    },
    'debugging', {
        addMessage: function(message) {
            return this.messages[message] ? ++this.messages[message] : this.messages[message] = 1;
        },
        warnOnce: function(message, what) {
            if (this.addMessage(message) == 1)
                console[what || "warn"](message);
        },
        printMethod: function(aMethod, optContext, optSel) {
            // return a 'class>>selector' description for the method
            if (aMethod.sqClass != this.specialObjects[Squeak.splOb_ClassCompiledMethod]) {
              return this.printMethod(aMethod.blockOuterCode(), optContext, optSel)
            }
            if (optSel) return optContext.className() + '>>' + optSel.bytesAsString();
            // this is expensive, we have to search all classes
            if (!aMethod) aMethod = this.activeContext.contextMethod();
            var found;
            this.allMethodsDo(function(classObj, methodObj, selectorObj) {
                if (methodObj === aMethod)
                    return found = classObj.className() + '>>' + selectorObj.bytesAsString();
            });
            if (found) return found;
            if (optContext) {
                var rcvr = optContext.pointers[Squeak.Context_receiver];
                return "(" + rcvr + ")>>?";
            }
            return "?>>?";
        },
        allInstancesOf: function(classObj, callback) {
            if (typeof classObj === "string") classObj = this.globalNamed(classObj);
            var instances = [],
                inst = this.image.someInstanceOf(classObj);
            while (inst) {
                if (callback) callback(inst);
                else instances.push(inst);
                inst = this.image.nextInstanceAfter(inst);
            }
            return instances;
        },
        globalNamed: function(name) {
            return this.allGlobalsDo(function(nameObj, globalObj){
                if (nameObj.bytesAsString() === name) return globalObj;
            });
        },
        allGlobalsDo: function(callback) {
            // callback(globalNameObj, globalObj), truish result breaks out of iteration
            var globals = this.globals;
            for (var i = 0; i < globals.length; i++) {
                var assn = globals[i];
                if (!assn.isNil) {
                    var result = callback(assn.pointers[0], assn.pointers[1]);
                    if (result) return result;
                }
            }
        },
        allMethodsDo: function(callback) {
            // callback(classObj, methodObj, selectorObj), truish result breaks out of iteration
            this.allGlobalsDo(function(globalNameObj, globalObj) {
                if (globalObj.pointers && globalObj.pointers.length >= 9) {
                    var clsAndMeta = [globalObj, globalObj.sqClass];
                    for (var c = 0; c < clsAndMeta.length; c++) {
                        var cls = clsAndMeta[c];
                        var mdict = cls.pointers[1];
                        if (!mdict.pointers || !mdict.pointers[1]) continue;
                        var methods = mdict.pointers[1].pointers;
                        if (!methods) continue;
                        var selectors = mdict.pointers;
                        if (methods.length + 2 !== selectors.length) continue;
                        for (var j = 0; j < methods.length; j++) {
                            var method = methods[j];
                            var selector = selectors[2+j];
                            if (!method.isMethod || !method.isMethod()) continue;
                            if (!selector.bytesSize || !selector.bytesSize()) continue;
                            var result = callback.call(null, cls, method, selector);
                            if (result) return true;
                        }
                    }
                }
            });
        },
        printStack: function(ctx, limit) {
            // both args are optional
            if (typeof ctx == "number") {limit = ctx; ctx = null;}
            if (!ctx) ctx = this.activeContext;
            if (!limit) limit = 100;
            var contexts = [],
                hardLimit = Math.max(limit, 1000000);
            while (!ctx.isNil && hardLimit-- > 0) {
                contexts.push(ctx);
                ctx = ctx.pointers[Squeak.Context_sender];
            }
            var extra = 200;
            if (contexts.length > limit + extra) {
                if (!ctx.isNil) contexts.push('...'); // over hard limit
                contexts = contexts.slice(0, limit).concat(['...']).concat(contexts.slice(-extra));
            }
            var stack = [],
                i = contexts.length;
            while (i-- > 0) {
                var ctx = contexts[i];
                if (!ctx.pointers) {
                    stack.push('...\n');
                } else {
                    var block = '',
                        method = ctx.pointers[Squeak.Context_method];
                    if (typeof method === 'number') { // it's a block context, fetch home
                        method = ctx.pointers[Squeak.BlockContext_home].pointers[Squeak.Context_method];
                        block = '[] in ';
                    } else if (!ctx.pointers[Squeak.Context_closure].isNil) {
                        block = '[] in '; // it's a closure activation
                    }
                    stack.push(block + this.printMethod(method, ctx) + '\n');
                }
            }
            return stack.join('');
        },
        findMethod: function(classAndMethodString) {
            // classAndMethodString is 'Class>>method'
            var found,
                className = classAndMethodString.split('>>')[0],
                methodName = classAndMethodString.split('>>')[1];
            this.allMethodsDo(function(classObj, methodObj, selectorObj) {
                if (methodName.length == selectorObj.bytesSize()
                    && methodName == selectorObj.bytesAsString()
                    && className == classObj.className())
                        return found = methodObj;
            });
            return found;
        },
        breakNow: function(msg) {
            if (msg) console.log("Break: " + msg);
            this.breakOutOfInterpreter = 'break';
        },
        breakOn: function(classAndMethodString) {
            // classAndMethodString is 'Class>>method'
            return this.breakOnMethod = classAndMethodString && this.findMethod(classAndMethodString);
        },
        breakOnReturnFromThisContext: function() {
            this.breakOnContextChanged = false;
            this.breakOnContextReturned = this.activeContext;
        },
        breakOnSendOrReturn: function() {
            this.breakOnContextChanged = true;
            this.breakOnContextReturned = null;
        },
        printActiveContext: function(maxWidth) {
            if (!maxWidth) maxWidth = 72;
            function printObj(obj) {
                var value = obj.sqInstName ? obj.sqInstName() : obj.toString();
                value = JSON.stringify(value).slice(1, -1);
                if (value.length > maxWidth - 3) value = value.slice(0, maxWidth - 3) + '...';
                return value;
            }
            // temps and stack in current context
            var ctx = this.activeContext;
            var isBlock = typeof ctx.pointers[Squeak.BlockContext_argumentCount] === 'number';
            var closure = ctx.pointers[Squeak.Context_closure];
            var isClosure = !isBlock && !closure.isNil;
            var homeCtx = isBlock ? ctx.pointers[Squeak.BlockContext_home] : ctx;
            var tempCount = isClosure
                ? closure.pointers[Squeak.Closure_numArgs]
                : homeCtx.pointers[Squeak.Context_method].methodTempCount();
            var stackBottom = this.decodeSqueakSP(0);
            var stackTop = homeCtx.contextSizeWithStack(this) - 1;
            var firstTemp = stackBottom + 1;
            var lastTemp = firstTemp + tempCount - 1;
            var stack = '';
            for (var i = stackBottom; i <= stackTop; i++) {
                var value = printObj(homeCtx.pointers[i]);
                var label = '';
                if (i == stackBottom) label = '=rcvr'; else
                if (i <= lastTemp) label = '=tmp' + (i - firstTemp);
                stack += '\nctx[' + i + ']' + label +': ' + value;
            }
            if (isBlock) {
                stack += '\n';
                var nArgs = ctx.pointers[3];
                var firstArg = this.decodeSqueakSP(1);
                var lastArg = firstArg + nArgs;
                for (var i = firstArg; i <= this.sp; i++) {
                    var value = printObj(ctx.pointers[i]);
                    var label = '';
                    if (i <= lastArg) label = '=arg' + (i - firstArg);
                    stack += '\nblk[' + i + ']' + label +': ' + value;
                }
            }
            return stack;
        },
        printAllProcesses: function() {
            var schedAssn = this.specialObjects[Squeak.splOb_SchedulerAssociation],
                sched = schedAssn.pointers[Squeak.Assn_value];
            // print active process
            var activeProc = sched.pointers[Squeak.ProcSched_activeProcess],
                result = "Active: " + this.printProcess(activeProc, true);
            // print other runnable processes
            var lists = sched.pointers[Squeak.ProcSched_processLists].pointers;
            for (var priority = lists.length - 1; priority >= 0; priority--) {
                var process = lists[priority].pointers[Squeak.LinkedList_firstLink];
                while (!process.isNil) {
                    result += "\nRunnable: " + this.printProcess(process);
                    process = process.pointers[Squeak.Link_nextLink];
                }
            }
            // print all processes waiting on a semaphore
            var semaClass = this.specialObjects[Squeak.splOb_ClassSemaphore],
                sema = this.image.someInstanceOf(semaClass);
            while (sema) {
                var process = sema.pointers[Squeak.LinkedList_firstLink];
                while (!process.isNil) {
                    result += "\nWaiting: " + this.printProcess(process);
                    process = process.pointers[Squeak.Link_nextLink];
                }
                sema = this.image.nextInstanceAfter(sema);
            }
            return result;
        },
        printProcess: function(process, active) {
            var context = process.pointers[Squeak.Proc_suspendedContext],
                priority = process.pointers[Squeak.Proc_priority],
                stack = this.printStack(active ? null : context);
            return process.toString() +" at priority " + priority + "\n" + stack;
        },
        printByteCodes: function(aMethod, optionalIndent, optionalHighlight, optionalPC) {
            if (!aMethod) aMethod = this.method;
            var printer = new Squeak.InstructionPrinter(aMethod, this);
            return printer.printInstructions(optionalIndent, optionalHighlight, optionalPC);
        },
        willSendOrReturn: function() {
            // Answer whether the next bytecode corresponds to a Smalltalk
            // message send or return
            var byte = this.method.bytes[this.pc];
            if (this.method.methodSignFlag()) {
              if (0x60 <= byte && byte <= 0x7F) {
                selectorObj = this.specialSelectors[2 * (byte - 0x60)];
              } else if (0x80 <= byte && byte <= 0xAF) {
                selectorObj = this.method.methodGetSelector(byte&0xF);
              } else if (byte == 0xEA || byte == 0xEB) {
                this.method.methodGetSelector((this.method.bytes[this.pc+1] >> 3)); // (extA << 5)
              } else if (0x58 <= byte && byte <= 0x5E) {
                return true; // return
              }
            } else {
              if (byte >= 120 && byte <= 125) return true; // return
              if (byte < 131 || byte == 200) return false;
              if (byte >= 176) return true; // special send or short send
              if (byte <= 134) {         // long sends
                // long form support demands we check the selector
                var litIndex;
                if (byte === 132) {
                  if ((this.method.bytes[this.pc + 1] >> 5) > 1) return false;
                  litIndex = this.method.bytes[this.pc + 2];
                } else
                  litIndex = this.method.bytes[this.pc + 1] & (byte === 134 ? 63 : 31);
                var selectorObj = this.method.methodGetLiteral(litIndex);
                if (selectorObj.bytesAsString() !== 'blockCopy:') return true;
              }
            }
            return false;
        },
        nextSendSelector: function() {
            // if the next bytecode corresponds to a Smalltalk
            // message send, answer the selector
            var byte = this.method.bytes[this.pc];
            var selectorObj;
            if (this.method.methodSignFlag()) {
              if (0x60 <= byte && byte <= 0x7F) {
                selectorObj = this.specialSelectors[2 * (byte - 0x60)];
              } else if (0x80 <= byte && byte <= 0xAF) {
                selectorObj = this.method.methodGetSelector(byte&0xF);
              } else if (byte == 0xEA || byte == 0xEB) {
                this.method.methodGetSelector((this.method.bytes[this.pc+1] >> 3)); // (extA << 5)
              } else {
                return null;
              }
            } else {
              if (byte < 131 || byte == 200) return null;
              if (byte >= 0xD0 ) {
                selectorObj = this.method.methodGetLiteral(byte & 0x0F);
              } else if (byte >= 0xB0 ) {
                selectorObj = this.specialSelectors[2 * (byte - 0xB0)];
              } else if (byte <= 134) {
                // long form support demands we check the selector
                var litIndex;
                if (byte === 132) {
                    if ((this.method.bytes[this.pc + 1] >> 5) > 1) return null;
                    litIndex = this.method.bytes[this.pc + 2];
                } else
                    litIndex = this.method.bytes[this.pc + 1] & (byte === 134 ? 63 : 31);
                selectorObj = this.method.methodGetLiteral(litIndex);
              }
            }
            if (selectorObj) {
              var selector = selectorObj.bytesAsString();
              if (selector !== 'blockCopy:') return selector;
            }
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.InterpreterProxy',
    // provides function names exactly like the C interpreter, for ease of porting
    // but maybe less efficiently because of the indirection
    // only used for plugins translated from Slang (see plugins/*.js)
    // built-in primitives use the interpreter directly
    'initialization', {
        VM_PROXY_MAJOR: 1,
        VM_PROXY_MINOR: 11,
        initialize: function(vm) {
            this.vm = vm;
            this.remappableOops = [];
            Object.defineProperty(this, 'successFlag', {
              get: function() { return vm.primHandler.success; },
              set: function(success) { vm.primHandler.success = success; },
            });
        },
        majorVersion: function() {
            return this.VM_PROXY_MAJOR;
        },
        minorVersion: function() {
            return this.VM_PROXY_MINOR;
        },
    },
    'success',
    {
        failed: function() {
            return !this.successFlag;
        },
        primitiveFail: function() {
            this.successFlag = false;
        },
        primitiveFailFor: function(reasonCode) {
            this.successFlag = false;
        },
        success: function(boolean) {
            if (!boolean) this.successFlag = false;
        },
    },
    'stack access',
    {
        pop: function(n) {
            this.vm.popN(n);
        },
        popthenPush: function(n, obj) {
            this.vm.popNandPush(n, obj);
        },
        push: function(obj) {
            this.vm.push(obj);
        },
        pushBool: function(bool) {
            this.vm.push(bool ? this.vm.trueObj : this.vm.falseObj);
        },
        pushInteger: function(int) {
            this.vm.push(int);
        },
        pushFloat: function(num) {
            this.vm.push(this.floatObjectOf(num));
        },
        stackValue: function(n) {
            return this.vm.stackValue(n);
        },
        stackIntegerValue: function(n) {
            var int = this.vm.stackValue(n);
            if (typeof int === "number") return int;
            this.successFlag = false;
            return 0;
        },
        stackFloatValue: function(n) {
            this.vm.success = true;
            var float = this.vm.stackIntOrFloat(n);
            if (this.vm.success) return float;
            this.successFlag = false;
            return 0;
        },
        stackObjectValue: function(n) {
            var obj = this.vm.stackValue(n);
            if (typeof obj !== "number") return obj;
            this.successFlag = false;
            return this.vm.nilObj;
        },
        stackBytes: function(n) {
            var oop = this.vm.stackValue(n);
            if (oop.bytes) return oop.bytes;
            if (typeof oop === "number" || !oop.isBytes()) this.successFlag = false;
            return [];
        },
        stackWords: function(n) {
            var oop = this.vm.stackValue(n);
            if (oop.words) return oop.words;
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        stackInt32Array: function(n) {
            var oop = this.vm.stackValue(n);
            if (oop.words) return oop.wordsAsInt32Array();
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        stackInt16Array: function(n) {
            var oop = this.vm.stackValue(n);
            if (oop.words) return oop.wordsAsInt16Array();
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        stackUint16Array: function(n) {
            var oop = this.vm.stackValue(n);
            if (oop.words) return oop.wordsAsUint16Array();
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
    },
    'object access',
    {
        isBytes: function(obj) {
            return typeof obj !== "number" && obj.isBytes();
        },
        isWords: function(obj) {
            return typeof obj !== "number" && obj.isWords();
        },
        isWordsOrBytes: function(obj) {
            return typeof obj !== "number" && obj.isWordsOrBytes();
        },
        isPointers: function(obj) {
            return typeof obj !== "number" && obj.isPointers();
        },
        isIntegerValue: function(obj) {
            return typeof obj === "number" && obj >= -0x40000000 && obj <= 0x3FFFFFFF;
        },
        isArray: function(obj) {
            return obj.sqClass === this.vm.specialObjects[Squeak.splOb_ClassArray];
        },
        isMemberOf: function(obj, className) {
            var nameBytes = obj.sqClass.pointers[Squeak.Class_name].bytes;
            if (className.length !== nameBytes.length) return false;
            for (var i = 0; i < className.length; i++)
                if (className.charCodeAt(i) !== nameBytes[i]) return false;
            return true;
        },
        booleanValueOf: function(obj) {
            if (obj.isTrue) return true;
            if (obj.isFalse) return false;
            this.successFlag = false;
            return false;
        },
        positive32BitValueOf: function(obj) {
            return this.vm.primHandler.positive32BitValueOf(obj);
        },
        positive32BitIntegerFor: function(int) {
            return this.vm.primHandler.pos32BitIntFor(int);
        },
        floatValueOf: function(obj) {
            if (obj.isFloat) return obj.float;
            this.successFlag = false;
            return 0;
        },
        floatObjectOf: function(num) {
            return this.vm.primHandler.makeFloat(num);
        },
        fetchPointerofObject: function(n, obj) {
            return obj.pointers[n];
        },
        fetchBytesofObject: function(n, obj) {
            var oop = obj.pointers[n];
            if (oop.bytes) return oop.bytes;
            if (oop.words) return oop.wordsAsUint8Array();
            if (typeof oop === "number" || !oop.isWordsOrBytes()) this.successFlag = false;
            return [];
        },
        fetchWordsofObject: function(n, obj) {
            var oop = obj.pointers[n];
            if (oop.words) return oop.words;
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        fetchInt32ArrayofObject: function(n, obj) {
            var oop = obj.pointers[n];
            if (oop.words) return oop.wordsAsInt32Array();
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        fetchInt16ArrayofObject: function(n, obj) {
            var oop = obj.pointers[n];
            if (oop.words) return oop.wordsAsInt16Array();
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        fetchUint16ArrayofObject: function(n, obj) {
            var oop = obj.pointers[n];
            if (oop.words) return oop.wordsAsUint16Array();
            if (typeof oop === "number" || !oop.isWords()) this.successFlag = false;
            return [];
        },
        fetchIntegerofObject: function(n, obj) {
            var int = obj.pointers[n];
            if (typeof int === "number") return int;
            this.successFlag = false;
            return 0;
        },
        fetchLong32ofObject: function(n, obj) {
            return obj.words[n];
        },
        fetchFloatofObject: function(n, obj) {
            return this.floatValueOf(obj.pointers[n]);
        },
        storeIntegerofObjectwithValue: function(n, obj, value) {
            if (typeof value === "number")
                obj.pointers[n] = value;
            else this.successFlag = false;
        },
        storePointerofObjectwithValue: function(n, obj, value) {
            obj.pointers[n] = value;
        },
        stObjectatput: function(array, index, obj) {
            if (array.sqClass !== this.classArray()) throw Error("Array expected");
            if (index < 1 || index >= array.pointers.length) return this.successFlag = false;
            array.pointers[index] = obj;
        },
    },
    'constant access',
    {
        isKindOfInteger: function(obj) {
            return typeof obj === "number" ||
                obj.sqClass == this.classLargeNegativeInteger() ||
                obj.sqClass == this.classLargePositiveInteger();
        },
        classArray: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassArray];
        },
        classBitmap: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassBitmap];
        },
        classSmallInteger: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassInteger];
        },
        classLargePositiveInteger: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassLargePositiveInteger];
        },
        classLargeNegativeInteger: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassLargeNegativeInteger];
        },
        classPoint: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassPoint];
        },
        classString: function() {
            return this.vm.specialObjects[Squeak.splOb_ClassString];
        },
        nilObject: function() {
            return this.vm.nilObj;
        },
        falseObject: function() {
            return this.vm.falseObj;
        },
        trueObject: function() {
            return this.vm.trueObj;
        },
    },
    'vm functions',
    {
        instantiateClassindexableSize: function(aClass, indexableSize) {
            return this.vm.instantiateClass(aClass, indexableSize);
        },
        methodArgumentCount: function() {
            return this.argCount;
        },
        makePointwithxValueyValue: function(x, y) {
            return this.vm.primHandler.makePointWithXandY(x, y);
        },
        pushRemappableOop: function(obj) {
            this.remappableOops.push(obj);
        },
        popRemappableOop: function() {
            return this.remappableOops.pop();
        },
        showDisplayBitsLeftTopRightBottom: function(form, left, top, right, bottom) {
            if (left < right && top < bottom) {
                var rect = {left: left, top: top, right: right, bottom: bottom};
                this.vm.primHandler.displayDirty(form, rect);
            }
        },
        ioLoadFunctionFrom: function(funcName, pluginName) {
            return this.vm.primHandler.loadFunctionFrom(funcName, pluginName);
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.InstructionStream',
    'initialization', {
        initialize: function(method, vm) {
            this.vm = vm;
            this.method = method;
            this.pc = 0;
            this.specialConstants = [vm.trueObj, vm.falseObj, vm.nilObj, -1, 0, 1, 2];
        },
    },
    'decoding', {
        interpretNextInstructionFor: function(client) {
            // Send to the argument, client, a message that specifies the type of the next instruction.
            var method = this.method;
            var byte = method.bytes[this.pc++];
            var type = (byte / 16) | 0;
            var offset = byte % 16;
            if (type === 0) return client.pushReceiverVariable(offset);
            if (type === 1) return client.pushTemporaryVariable(offset);
            if (type === 2) return client.pushConstant(method.methodGetLiteral(offset));
            if (type === 3) return client.pushConstant(method.methodGetLiteral(offset + 16));
            if (type === 4) return client.pushLiteralVariable(method.methodGetLiteral(offset));
            if (type === 5) return client.pushLiteralVariable(method.methodGetLiteral(offset + 16));
            if (type === 6)
                if (offset<8) return client.popIntoReceiverVariable(offset)
                else return client.popIntoTemporaryVariable(offset-8);
            if (type === 7) {
                if (offset===0) return client.pushReceiver()
                if (offset < 8) return client.pushConstant(this.specialConstants[offset - 1])
                if (offset===8) return client.methodReturnReceiver();
                if (offset < 12) return client.methodReturnConstant(this.specialConstants[offset - 9]);
                if (offset===12) return client.methodReturnTop();
                if (offset===13) return client.blockReturnTop();
                if (offset > 13) throw Error("unusedBytecode");
            }
            if (type === 8) return this.interpretExtension(offset, method, client);
            if (type === 9) // short jumps
                    if (offset<8) return client.jump(offset+1);
                    else return client.jumpIf(false, offset-8+1);
            if (type === 10) {// long jumps
                byte = this.method.bytes[this.pc++];
                if (offset<8) return client.jump((offset-4)*256 + byte);
                else return client.jumpIf(offset<12, (offset & 3)*256 + byte);
            }
            if (type === 11)
                return client.send(this.vm.specialSelectors[2 * offset],
                    this.vm.specialSelectors[2 * offset + 1],
                    false);
            if (type === 12)
                return client.send(this.vm.specialSelectors[2 * (offset + 16)],
                    this.vm.specialSelectors[2 * (offset + 16) + 1],
                    false);
            if (type > 12)
                return client.send(method.methodGetLiteral(offset), type-13, false);
        },
        interpretExtension: function(offset, method, client) {
            if (offset <= 6) { // Extended op codes 128-134
                var byte2 = this.method.bytes[this.pc++];
                if (offset <= 2) { // 128-130:  extended pushes and pops
                    var type = byte2 / 64 | 0;
                    var offset2 = byte2 % 64;
                    if (offset === 0) {
                        if (type === 0) return client.pushReceiverVariable(offset2);
                        if (type === 1) return client.pushTemporaryVariable(offset2);
                        if (type === 2) return client.pushConstant(this.method.methodGetLiteral(offset2));
                        if (type === 3) return client.pushLiteralVariable(this.method.methodGetLiteral(offset2));
                    }
                    if (offset === 1) {
                        if (type === 0) return client.storeIntoReceiverVariable(offset2);
                        if (type === 1) return client.storeIntoTemporaryVariable(offset2);
                        if (type === 2) throw Error("illegalStore");
                        if (type === 3) return client.storeIntoLiteralVariable(this.method.methodGetLiteral(offset2));
                    }
                    if (offset === 2) {
                        if (type === 0) return client.popIntoReceiverVariable(offset2);
                        if (type === 1) return client.popIntoTemporaryVariable(offset2);
                        if (type === 2) throw Error("illegalStore");
                        if (type === 3) return client.popIntoLiteralVariable(this.method.methodGetLiteral(offset2));
                    }
                }
                // 131-134 (extended sends)
                if (offset === 3) // Single extended send
                    return client.send(this.method.methodGetLiteral(byte2 % 32), byte2 / 32 | 0, false);
                if (offset === 4) { // Double extended do-anything
                    var byte3 = this.method.bytes[this.pc++];
                    var type = byte2 / 32 | 0;
                    if (type === 0) return client.send(this.method.methodGetLiteral(byte3), byte2 % 32, false);
                    if (type === 1) return client.send(this.method.methodGetLiteral(byte3), byte2 % 32, true);
                    if (type === 2) return client.pushReceiverVariable(byte3);
                    if (type === 3) return client.pushConstant(this.method.methodGetLiteral(byte3));
                    if (type === 4) return client.pushLiteralVariable(this.method.methodGetLiteral(byte3));
                    if (type === 5) return client.storeIntoReceiverVariable(byte3);
                    if (type === 6) return client.popIntoReceiverVariable(byte3);
                    if (type === 7) return client.storeIntoLiteralVariable(this.method.methodGetLiteral(byte3));
                }
                if (offset === 5) // Single extended send to super
                    return client.send(this.method.methodGetLiteral(byte2 & 31), byte2 >> 5, true);
                if (offset === 6) // Second extended send
                    return client.send(this.method.methodGetLiteral(byte2 & 63), byte2 >> 6, false);
            }
            if (offset === 7) return client.doPop();
            if (offset === 8) return client.doDup();
            if (offset === 9) return client.pushActiveContext();
            // closures
            var byte2 = this.method.bytes[this.pc++];
            if (offset === 10)
                return byte2 < 128 ? client.pushNewArray(byte2) : client.popIntoNewArray(byte2 - 128);
            var byte3 = this.method.bytes[this.pc++];
            if (offset === 11) return client.callPrimitive(byte2 + 256 * byte3);
            if (offset === 12) return client.pushRemoteTemp(byte2, byte3);
            if (offset === 13) return client.storeIntoRemoteTemp(byte2, byte3);
            if (offset === 14) return client.popIntoRemoteTemp(byte2, byte3);
            // offset === 15
            var byte4 = this.method.bytes[this.pc++];
            return client.pushClosureCopy(byte2 >> 4, byte2 & 0xF, (byte3 * 256) + byte4);
        }
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Squeak.InstructionStream.subclass('Squeak.InstructionStreamSista',
    'decoding', {
        interpretNextInstructionFor: function(client) {
            return this.interpretNextInstructionExtFor(client, 0, 0);
        },
        interpretNextInstructionExtFor: function(client, extA, extB) {
            var Squeak = this.Squeak; // avoid dynamic lookup of "Squeak" in Lively
            // Send to the argument, client, a message that specifies the type of the next instruction.
            var b = this.method.bytes[this.pc++];
            switch (b) {

                case 0x00: case 0x01: case 0x02: case 0x03: case 0x04: case 0x05: case 0x06: case 0x07:
                case 0x08: case 0x09: case 0x0A: case 0x0B: case 0x0C: case 0x0D: case 0x0E: case 0x0F:
                    return client.pushReceiverVariable(b&0xF);

                case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x17:
                case 0x18: case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E: case 0x1F:
                    return client.pushLiteralVariable(this.method.methodGetLiteral(b&0xF));

                case 0x20: case 0x21: case 0x22: case 0x23: case 0x24: case 0x25: case 0x26: case 0x27:
                case 0x28: case 0x29: case 0x2A: case 0x2B: case 0x2C: case 0x2D: case 0x2E: case 0x2F:
                case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37:
                case 0x38: case 0x39: case 0x3A: case 0x3B: case 0x3C: case 0x3D: case 0x3E: case 0x3F:
                    return client.pushConstant(this.method.methodGetLiteral(b&0x1F));

                case 0x40: case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46: case 0x47:
                    return client.pushTemporaryVariable(b&0xF);
                case 0x48: case 0x49: case 0x4A: case 0x4B:
                    return client.pushTemporaryVariable((b&0x3)+8);
                case 0x4C: return client.pushReceiver();
                case 0x4D: return client.pushConstant(this.vm.trueObj);
                case 0x4E: return client.pushConstant(this.vm.falseObj);
                case 0x4F: return client.pushConstant(this.vm.nilObj);
                case 0x50: return client.pushConstant(0);
                case 0x51: return client.pushConstant(1);
                case 0x52: return client.pushActiveContext();
                case 0x53: return client.doDup();
                case 0x58: return client.methodReturnReceiver();
                case 0x59: return client.methodReturnConstant(this.vm.trueObj);
                case 0x5A: return client.methodReturnConstant(this.vm.falseObj);
                case 0x5B: return client.methodReturnConstant(this.vm.nilObj);
                case 0x5C: return client.methodReturnTop();
                case 0x5D: return client.blockReturnConstant(this.vm.nilObj);
                case 0x5E: if (extA===0) return client.blockReturnTop(); else break;
                case 0x5F: return client.nop();
                case 0x60: case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66: case 0x67:
                case 0x68: case 0x69: case 0x6A: case 0x6B: case 0x6C: case 0x6D: case 0x6E: case 0x6F:
                case 0x70: case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: case 0x77:
                case 0x78: case 0x79: case 0x7A: case 0x7B: case 0x7C: case 0x7D: case 0x7E: case 0x7F:
                    return client.send(this.vm.specialSelectors[2 * (b - 0x60)],
                        this.vm.specialSelectors[2 * (b - 0x60) + 1], false);

                case 0x80: case 0x81: case 0x82: case 0x83: case 0x84: case 0x85: case 0x86: case 0x87:
                case 0x88: case 0x89: case 0x8A: case 0x8B: case 0x8C: case 0x8D: case 0x8E: case 0x8F:
                    return client.send(this.method.methodGetLiteral(b&0xF), 0, false);
                case 0x90: case 0x91: case 0x92: case 0x93: case 0x94: case 0x95: case 0x96: case 0x97:
                case 0x98: case 0x99: case 0x9A: case 0x9B: case 0x9C: case 0x9D: case 0x9E: case 0x9F:
                    return client.send(this.method.methodGetLiteral(b&0xF), 1, false);
                case 0xA0: case 0xA1: case 0xA2: case 0xA3: case 0xA4: case 0xA5: case 0xA6: case 0xA7:
                case 0xA8: case 0xA9: case 0xAA: case 0xAB: case 0xAC: case 0xAD: case 0xAE: case 0xAF:
                    return client.send(this.method.methodGetLiteral(b&0xF), 2, false);
                case 0xB0: case 0xB1: case 0xB2: case 0xB3: case 0xB4: case 0xB5: case 0xB6: case 0xB7:
                    return client.jump((b&7) + 1);
                case 0xB8: case 0xB9: case 0xBA: case 0xBB: case 0xBC: case 0xBD: case 0xBE: case 0xBF:
                    return client.jumpIf(true, (b&7) + 1);
                case 0xC0: case 0xC1: case 0xC2: case 0xC3: case 0xC4: case 0xC5: case 0xC6: case 0xC7:
                    return client.jumpIf(false, (b&7) + 1);
                case 0xC8: case 0xC9: case 0xCA: case 0xCB: case 0xCC: case 0xCD: case 0xCE: case 0xCF:
                    return client.popIntoReceiverVariable(b&7)
                case 0xD0: case 0xD1: case 0xD2: case 0xD3: case 0xD4: case 0xD5: case 0xD6: case 0xD7:
                    return client.popIntoTemporaryVariable(b - 0xD0);
                case 0xD8: return client.doPop();
            }
            var b2 = this.method.bytes[this.pc++];
            switch (b) {
                case 0xE0: return this.interpretNextInstructionExtFor(client, (extA << 8) + b2, extB);
                case 0xE1: return this.interpretNextInstructionExtFor(client, extA, (extB << 8) + (b2 < 128 ? b2 : b2-256));
                case 0xE2:
                    return client.pushReceiverVariable(b2 + (extA << 8));
                case 0xE3:
                    return client.pushLiteralVariable(this.method.methodGetLiteral(b2 + (extA << 8)));
                case 0xE4:
                    return client.pushConstant(this.method.methodGetLiteral(b2 + (extA << 8)));
                case 0xE5:
                    return client.pushTemporaryVariable(b2);
                case 0xE7: {
                    return b2 < 128 ? client.pushNewArray(b2) : client.popIntoNewArray(b2 - 128);
                }
                case 0xE8: return client.pushConstant(b2 + (extB << 8));
                case 0xE9: return client.pushConstant("$" + b2 + (extB << 8));
                case 0xEA: return client.send(this.method.methodGetSelector((b2 >> 3) + (extA << 5)), (b2 & 7) + (extB << 3), false);
                case 0xEB:
                    var literal = this.method.methodGetSelector((b2 >> 3) + (extA << 5));
                    if (extB >= 64) {
                        return client.sendSuperDirected(literal);
                    } else {
                        return client.send(literal, (b2 & 7) + (extB << 3), true);
                    }
                case 0xED:
                    return client.jump(b2 + (extB << 8));
                case 0xEE:
                    return client.jumpIf(true, b2 + (extB << 8));
                case 0xEF:
                    return client.jumpIf(false, b2 + (extB << 8));
                case 0xF0:
                    return client.popIntoReceiverVariable(b2 + (extA << 8));
                case 0xF1:
                    return client.popIntoLiteralVariable(this.method.methodGetLiteral(b2 + (extA << 8)));
                case 0xF2:
                    return client.popIntoTemporaryVariable(b2);
                case 0xF3:
                    return client.storeIntoReceiverVariable(b2 + (extA << 8));
                case 0xF4:
                    return client.storeIntoLiteralVariable(this.method.methodGetLiteral(b2 + (extA << 8)));
                case 0xF5:
                    return client.storeIntoTemporaryVariable(b2);
            }
            var b3 = this.method.bytes[this.pc++];
            switch (b) {
                case 0xF8: return client.callPrimitive(b2 + (b3 << 8));
                case 0xF9: {
                    var literalIndex = b2 + (extA << 8),
                        numCopied = b3 & 63,
                        compiledBlock = this.method.methodGetLiteral(literalIndex);
                    return client.pushFullClosure(literalIndex, numCopied, compiledBlock.methodNumArgs());
                }
                case 0xFA: {
                    var numArgs = (b2 & 7) + this.mod(extA, 16) * 8,
                        numCopied = (b2 >> 3 & 0x7) + this.div(extA, 16) * 8,
                        blockSize = b3 + (extB << 8);
                    return client.pushClosureCopy(numCopied, numArgs, blockSize);
                }
                case 0xFB:
                    return client.pushRemoteTemp(b2, b3);
                case 0xFC:
                    return client.storeIntoRemoteTemp(b2, b3);
                case 0xFD:
                    return client.popIntoRemoteTemp(b2, b3);
            }
            throw Error("Unknown bytecode: " + b);
        }
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.InstructionPrinter',
    'initialization', {
        initialize: function(method, vm) {
            this.method = method;
            this.vm = vm;
        },
    },
    'printing', {
        printInstructions: function(indent, highlight, highlightPC) {
            // all args are optional
            this.indent = indent;           // prepend to every line except if highlighted
            this.highlight = highlight;     // prepend to highlighted line
            this.highlightPC = highlightPC; // PC of highlighted line
            this.innerIndents = {};
            this.result = '';
            this.scanner = this.method.methodSignFlag()
                ? new Squeak.InstructionStreamSista(this.method, this.vm)
                : new Squeak.InstructionStream(this.method, this.vm);
            this.oldPC = this.scanner.pc;
            this.endPC = 0;                 // adjusted while scanning
            this.done = false;
            try {
                while (!this.done)
                    this.scanner.interpretNextInstructionFor(this);
            } catch(ex) {
                this.print("!!! " + ex.message);
            }
            return this.result;
        },
        print: function(instruction) {
            if (this.oldPC === this.highlightPC) {
                if (this.highlight) this.result += this.highlight;
            } else {
                if (this.indent) this.result += this.indent;
            }
            this.result += this.oldPC;
            for (var i = 0; i < this.innerIndents[this.oldPC] || 0; i++)
                this.result += "   ";
            this.result += " <";
            for (var i = this.oldPC; i < this.scanner.pc; i++) {
                if (i > this.oldPC) this.result += " ";
                this.result += (this.method.bytes[i]+0x100).toString(16).substr(-2).toUpperCase(); // padded hex
            }
            this.result += "> " + instruction + "\n";
            this.oldPC = this.scanner.pc;
        }
    },
    'decoding', {
        blockReturnConstant: function(obj) {
            this.print('blockReturn: ' + obj.toString());
        },
        blockReturnTop: function() {
            this.print('blockReturn');
        },
        doDup: function() {
            this.print('dup');
        },
        doPop: function() {
            this.print('pop');
        },
        jump: function(offset) {
            this.print('jumpTo: ' + (this.scanner.pc + offset));
            if (this.scanner.pc + offset > this.endPC) this.endPC = this.scanner.pc + offset;
        },
        jumpIf: function(condition, offset) {
            this.print((condition ? 'jumpIfTrue: ' : 'jumpIfFalse: ') + (this.scanner.pc + offset));
            if (this.scanner.pc + offset > this.endPC) this.endPC = this.scanner.pc + offset;
        },
        methodReturnReceiver: function() {
            this.print('return: receiver');
            this.done = this.scanner.pc > this.endPC;
        },
        methodReturnTop: function() {
            this.print('return: topOfStack');
            this.done = this.scanner.pc > this.endPC;
        },
        methodReturnConstant: function(obj) {
            this.print('returnConst: ' + obj.toString());
            this.done = this.scanner.pc > this.endPC;
        },
        nop: function() {
            this.print('nop');
        },
        popIntoLiteralVariable: function(anAssociation) {
            this.print('popIntoBinding: ' + anAssociation.assnKeyAsString());
        },
        popIntoReceiverVariable: function(offset) {
            this.print('popIntoInstVar: ' + offset);
        },
        popIntoTemporaryVariable: function(offset) {
            this.print('popIntoTemp: ' + offset);
        },
        pushActiveContext: function() {
            this.print('push: thisContext');
        },
        pushConstant: function(obj) {
            var value = obj.sqInstName ? obj.sqInstName() : obj.toString();
            this.print('pushConst: ' + value);
        },
        pushLiteralVariable: function(anAssociation) {
            this.print('pushBinding: ' + anAssociation.assnKeyAsString());
        },
        pushReceiver: function() {
            this.print('push: self');
        },
        pushReceiverVariable: function(offset) {
            this.print('pushInstVar: ' + offset);
        },
        pushTemporaryVariable: function(offset) {
            this.print('pushTemp: ' + offset);
        },
        send: function(selector, numberArguments, supered) {
            this.print( (supered ? 'superSend: #' : 'send: #') + (selector.bytesAsString ? selector.bytesAsString() : selector));
        },
        sendSuperDirected: function(selector) {
            this.print('directedSuperSend: #' + (selector.bytesAsString ? selector.bytesAsString() : selector));
        },
        storeIntoLiteralVariable: function(anAssociation) {
            this.print('storeIntoBinding: ' + anAssociation.assnKeyAsString());
        },
        storeIntoReceiverVariable: function(offset) {
            this.print('storeIntoInstVar: ' + offset);
        },
        storeIntoTemporaryVariable: function(offset) {
            this.print('storeIntoTemp: ' + offset);
        },
        pushNewArray: function(size) {
            this.print('push: (Array new: ' + size + ')');
        },
        popIntoNewArray: function(numElements) {
            this.print('pop: ' + numElements + ' into: (Array new: ' + numElements + ')');
        },
        pushRemoteTemp: function(offset , arrayOffset) {
            this.print('push: ' + offset + ' ofTemp: ' + arrayOffset);
        },
        storeIntoRemoteTemp: function(offset , arrayOffset) {
            this.print('storeInto: ' + offset + ' ofTemp: ' + arrayOffset);
        },
        popIntoRemoteTemp: function(offset , arrayOffset) {
            this.print('popInto: ' + offset + ' ofTemp: ' + arrayOffset);
        },
        pushClosureCopy: function(numCopied, numArgs, blockSize) {
            var from = this.scanner.pc,
                to = from + blockSize;
            this.print('closure(' + from + '-' + (to-1) + '): ' + numCopied + ' copied, ' + numArgs + ' args');
            for (var i = from; i < to; i++)
                this.innerIndents[i] = (this.innerIndents[i] || 0) + 1;
            if (to > this.endPC) this.endPC = to;
        },
        pushFullClosure: function(literalIndex, numCopied, numArgs) {
            this.print('pushFullClosure: (self literalAt: ' + literalIndex + ') numCopied: ' + numCopied + ' numArgs: ' + numArgs);
        },
        callPrimitive: function(primitiveIndex) {
            this.print('primitive: ' + primitiveIndex);
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.Primitives',
    'initialization', {
        initialize: function(vm, display) {
            this.vm = vm;
            this.oldPrims = !this.vm.image.hasClosures;
            this.allowAccessBeyondSP = this.oldPrims;
            this.deferDisplayUpdates = false;
            this.semaphoresToSignal = [];
            this.initDisplay(display);
            this.initAtCache();
            this.initModules();
            this.initPlugins();
            if (vm.image.isSpur) {
                this.charFromInt = this.charFromIntSpur;
                this.charToInt = this.charToIntSpur;
                this.identityHash = this.identityHashSpur;
            }
        },
        initDisplay: function(display) {
            // Placeholder (can be replaced by a display module at runtime, before starting the Squeak interpreter)
            this.display = display;
        },
        initModules: function() {
            this.loadedModules = {};
            this.builtinModules = {};
            this.patchModules = {};
            this.interpreterProxy = new Squeak.InterpreterProxy(this.vm);
        },
        initPlugins: function() {
            // Empty placeholder (can be replaced by a plugins module at runtime, before starting the Squeak interpreter)
        }
    },
    'dispatch', {
        quickSendOther: function(rcvr, lobits) {
            // returns true if it succeeds
            this.success = true;
            switch (lobits) {
                case 0x0: return this.popNandPushIfOK(2, this.objectAt(true,true,false)); // at:
                case 0x1: return this.popNandPushIfOK(3, this.objectAtPut(true,true,false)); // at:put:
                case 0x2: return this.popNandPushIfOK(1, this.objectSize(true)); // size
                //case 0x3: return false; // next
                //case 0x4: return false; // nextPut:
                //case 0x5: return false; // atEnd
                case 0x6: return this.pop2andPushBoolIfOK(this.vm.stackValue(1) === this.vm.stackValue(0)); // ==
                case 0x7: return this.popNandPushIfOK(1,this.vm.getClass(this.vm.top())); // class
                case 0x8: return this.popNandPushIfOK(2,this.doBlockCopy()); // blockCopy:
                case 0x9: return this.primitiveBlockValue(0); // value
                case 0xA: return this.primitiveBlockValue(1); // value:
                //case 0xB: return false; // do:
                //case 0xC: return false; // new
                //case 0xD: return false; // new:
                //case 0xE: return false; // x
                //case 0xF: return false; // y
            }
            return false;
        },
        doPrimitive: function(index, argCount, primMethod) {
            this.success = true;
            switch (index) {
                // Integer Primitives (0-19)
                case 1: return this.popNandPushIntIfOK(2,this.stackInteger(1) + this.stackInteger(0));  // Integer.add
                case 2: return this.popNandPushIntIfOK(2,this.stackInteger(1) - this.stackInteger(0));  // Integer.subtract
                case 3: return this.pop2andPushBoolIfOK(this.stackInteger(1) < this.stackInteger(0));   // Integer.less
                case 4: return this.pop2andPushBoolIfOK(this.stackInteger(1) > this.stackInteger(0));   // Integer.greater
                case 5: return this.pop2andPushBoolIfOK(this.stackInteger(1) <= this.stackInteger(0));  // Integer.leq
                case 6: return this.pop2andPushBoolIfOK(this.stackInteger(1) >= this.stackInteger(0));  // Integer.geq
                case 7: return this.pop2andPushBoolIfOK(this.stackInteger(1) === this.stackInteger(0)); // Integer.equal
                case 8: return this.pop2andPushBoolIfOK(this.stackInteger(1) !== this.stackInteger(0)); // Integer.notequal
                case 9: return this.popNandPushIntIfOK(2,this.stackInteger(1) * this.stackInteger(0));  // Integer.multiply *
                case 10: return this.popNandPushIntIfOK(2,this.vm.quickDivide(this.stackInteger(1),this.stackInteger(0)));  // Integer.divide /  (fails unless exact)
                case 11: return this.popNandPushIntIfOK(2,this.vm.mod(this.stackInteger(1),this.stackInteger(0)));  // Integer.mod \\
                case 12: return this.popNandPushIntIfOK(2,this.vm.div(this.stackInteger(1),this.stackInteger(0)));  // Integer.div //
                case 13: return this.popNandPushIntIfOK(2,this.stackInteger(1) / this.stackInteger(0) | 0);  // Integer.quo
                case 14: return this.popNandPushIfOK(2,this.doBitAnd());  // SmallInt.bitAnd
                case 15: return this.popNandPushIfOK(2,this.doBitOr());  // SmallInt.bitOr
                case 16: return this.popNandPushIfOK(2,this.doBitXor());  // SmallInt.bitXor
                case 17: return this.popNandPushIfOK(2,this.doBitShift());  // SmallInt.bitShift
                case 18: return this.primitiveMakePoint(argCount, false);
                case 19: return false;                                 // Guard primitive for simulation -- *must* fail
                // LargeInteger Primitives (20-39)
                // 32-bit logic is aliased to Integer prims above
                case 20: this.vm.warnOnce("missing primitive: 20 (primitiveRemLargeIntegers)"); return false;
                case 21: this.vm.warnOnce("missing primitive: 21 (primitiveAddLargeIntegers)"); return false;
                case 22: this.vm.warnOnce("missing primitive: 22 (primitiveSubtractLargeIntegers)"); return false;
                case 23: return this.primitiveLessThanLargeIntegers();
                case 24: return this.primitiveGreaterThanLargeIntegers();
                case 25: return this.primitiveLessOrEqualLargeIntegers();
                case 26: return this.primitiveGreaterOrEqualLargeIntegers();
                case 27: return this.primitiveEqualLargeIntegers();
                case 28: return this.primitiveNotEqualLargeIntegers();
                case 29: this.vm.warnOnce("missing primitive: 29 (primitiveMultiplyLargeIntegers)"); return false;
                case 30: this.vm.warnOnce("missing primitive: 30 (primitiveDivideLargeIntegers)"); return false;
                case 31: this.vm.warnOnce("missing primitive: 31 (primitiveModLargeIntegers)"); return false;
                case 32: this.vm.warnOnce("missing primitive: 32 (primitiveDivLargeIntegers)"); return false;
                case 33: this.vm.warnOnce("missing primitive: 33 (primitiveQuoLargeIntegers)"); return false;
                case 34: this.vm.warnOnce("missing primitive: 34 (primitiveBitAndLargeIntegers)"); return false;
                case 35: this.vm.warnOnce("missing primitive: 35 (primitiveBitOrLargeIntegers)"); return false;
                case 36: this.vm.warnOnce("missing primitive: 36 (primitiveBitXorLargeIntegers)"); return false;
                case 37: this.vm.warnOnce("missing primitive: 37 (primitiveBitShiftLargeIntegers)"); return false;
                case 38: return this.popNandPushIfOK(argCount+1, this.objectAt(false,false,false)); // Float basicAt
                case 39: return this.popNandPushIfOK(argCount+1, this.objectAtPut(false,false,false)); // Float basicAtPut
                // Float Primitives (40-59)
                case 40: return this.popNandPushFloatIfOK(argCount+1,this.stackInteger(0)); // primitiveAsFloat
                case 41: return this.popNandPushFloatIfOK(argCount+1,this.stackFloat(1)+this.stackFloat(0));  // Float +
                case 42: return this.popNandPushFloatIfOK(argCount+1,this.stackFloat(1)-this.stackFloat(0));  // Float -
                case 43: return this.pop2andPushBoolIfOK(this.stackFloat(1)<this.stackFloat(0));  // Float <
                case 44: return this.pop2andPushBoolIfOK(this.stackFloat(1)>this.stackFloat(0));  // Float >
                case 45: return this.pop2andPushBoolIfOK(this.stackFloat(1)<=this.stackFloat(0));  // Float <=
                case 46: return this.pop2andPushBoolIfOK(this.stackFloat(1)>=this.stackFloat(0));  // Float >=
                case 47: return this.pop2andPushBoolIfOK(this.stackFloat(1)===this.stackFloat(0));  // Float =
                case 48: return this.pop2andPushBoolIfOK(this.stackFloat(1)!==this.stackFloat(0));  // Float !=
                case 49: return this.popNandPushFloatIfOK(argCount+1,this.stackFloat(1)*this.stackFloat(0));  // Float.mul
                case 50: return this.popNandPushFloatIfOK(argCount+1,this.safeFDiv(this.stackFloat(1),this.stackFloat(0)));  // Float.div
                case 51: return this.popNandPushIfOK(argCount+1,this.floatAsSmallInt(this.stackFloat(0)));  // Float.asInteger
                case 52: return this.popNandPushFloatIfOK(argCount+1,this.floatFractionPart(this.stackFloat(0)));
                case 53: return this.popNandPushIntIfOK(argCount+1, this.frexp_exponent(this.stackFloat(0)) - 1); // Float.exponent
                case 54: return this.popNandPushFloatIfOK(2, this.ldexp(this.stackFloat(1), this.stackFloat(0))); // Float.timesTwoPower
                case 55: return this.popNandPushFloatIfOK(argCount+1, Math.sqrt(this.stackFloat(0))); // SquareRoot
                case 56: return this.popNandPushFloatIfOK(argCount+1, Math.sin(this.stackFloat(0))); // Sine
                case 57: return this.popNandPushFloatIfOK(argCount+1, Math.atan(this.stackFloat(0))); // Arctan
                case 58: return this.popNandPushFloatIfOK(argCount+1, Math.log(this.stackFloat(0))); // LogN
                case 59: return this.popNandPushFloatIfOK(argCount+1, Math.exp(this.stackFloat(0))); // Exp
                // Subscript and Stream Primitives (60-67)
                case 60: return this.popNandPushIfOK(argCount+1, this.objectAt(false,false,false)); // basicAt:
                case 61: return this.popNandPushIfOK(argCount+1, this.objectAtPut(false,false,false)); // basicAt:put:
                case 62: return this.popNandPushIfOK(argCount+1, this.objectSize(false)); // size
                case 63: return this.popNandPushIfOK(argCount+1, this.objectAt(false,true,false)); // String.basicAt:
                case 64: return this.popNandPushIfOK(argCount+1, this.objectAtPut(false,true,false)); // String.basicAt:put:
                case 65: this.vm.warnOnce("missing primitive: 65 (primitiveNext)"); return false;
                case 66: this.vm.warnOnce("missing primitive: 66 (primitiveNextPut)"); return false;
                case 67: this.vm.warnOnce("missing primitive: 67 (primitiveAtEnd)"); return false;
                // StorageManagement Primitives (68-79)
                case 68: return this.popNandPushIfOK(argCount+1, this.objectAt(false,false,true)); // Method.objectAt:
                case 69: return this.popNandPushIfOK(argCount+1, this.objectAtPut(false,false,true)); // Method.objectAt:put:
                case 70: return this.popNandPushIfOK(argCount+1, this.instantiateClass(this.stackNonInteger(0), 0)); // Class.new
                case 71: return this.popNandPushIfOK(argCount+1, this.instantiateClass(this.stackNonInteger(1), this.stackPos32BitInt(0))); // Class.new:
                case 72: return this.primitiveArrayBecome(argCount, false, true); // one way, do copy hash
                case 73: return this.popNandPushIfOK(argCount+1, this.objectAt(false,false,true)); // instVarAt:
                case 74: return this.popNandPushIfOK(argCount+1, this.objectAtPut(false,false,true)); // instVarAt:put:
                case 75: return this.popNandPushIfOK(argCount+1, this.identityHash(this.stackNonInteger(0))); // Object.identityHash
                case 76: return this.primitiveStoreStackp(argCount);  // (Blue Book: primitiveAsObject)
                case 77: return this.popNandPushIfOK(argCount+1, this.someInstanceOf(this.stackNonInteger(0))); // Class.someInstance
                case 78: return this.popNandPushIfOK(argCount+1, this.nextInstanceAfter(this.stackNonInteger(0))); // Object.nextInstance
                case 79: return this.primitiveNewMethod(argCount); // Compiledmethod.new
                // Control Primitives (80-89)
                case 80: return this.popNandPushIfOK(2,this.doBlockCopy()); // blockCopy:
                case 81: return this.primitiveBlockValue(argCount); // BlockContext.value
                case 82: return this.primitiveBlockValueWithArgs(argCount); // BlockContext.valueWithArguments:
                case 83: return this.vm.primitivePerform(argCount); // Object.perform:(with:)*
                case 84: return this.vm.primitivePerformWithArgs(argCount, false); //  Object.perform:withArguments:
                case 85: return this.primitiveSignal(); // Semaphore.wait
                case 86: return this.primitiveWait(); // Semaphore.wait
                case 87: return this.primitiveResume(); // Process.resume
                case 88: return this.primitiveSuspend(); // Process.suspend
                case 89: return this.vm.flushMethodCache(); //primitiveFlushCache
                // Input/Output Primitives (90-109)
                case 90: return this.primitiveMousePoint(argCount); // mousePoint
                case 91: return this.primitiveTestDisplayDepth(argCount); // cursorLocPut in old images
                case 92: this.vm.warnOnce("missing primitive: 92 (primitiveSetDisplayMode)"); return false;
                case 93: return this.primitiveInputSemaphore(argCount);
                case 94: return this.primitiveGetNextEvent(argCount);
                case 95: return this.primitiveInputWord(argCount);
                case 96: return this.namedPrimitive('BitBltPlugin', 'primitiveCopyBits', argCount);
                case 97: return this.primitiveSnapshot(argCount);
                case 98: this.vm.warnOnce("missing primitive 98 (primitiveStoreImageSegment)"); return false;
                case 99: return this.primitiveLoadImageSegment(argCount);
                case 100: return this.vm.primitivePerformWithArgs(argCount, true); // Object.perform:withArguments:inSuperclass: (Blue Book: primitiveSignalAtTick)
                case 101: return this.primitiveBeCursor(argCount); // Cursor.beCursor
                case 102: return this.primitiveBeDisplay(argCount); // DisplayScreen.beDisplay
                case 103: return this.primitiveScanCharacters(argCount);
                case 104: this.vm.warnOnce("missing primitive: 104 (primitiveDrawLoop)"); return false;
                case 105: return this.popNandPushIfOK(argCount+1, this.doStringReplace()); // string and array replace
                case 106: return this.primitiveScreenSize(argCount); // actualScreenSize
                case 107: return this.primitiveMouseButtons(argCount); // Sensor mouseButtons
                case 108: return this.primitiveKeyboardNext(argCount); // Sensor kbdNext
                case 109: return this.primitiveKeyboardPeek(argCount); // Sensor kbdPeek
                // System Primitives (110-119)
                case 110: return this.pop2andPushBoolIfOK(this.vm.stackValue(1) === this.vm.stackValue(0)); // ==
                case 111: return this.popNandPushIfOK(argCount+1, this.vm.getClass(this.vm.top())); // Object.class
                case 112: return this.popNandPushIfOK(argCount+1, this.vm.image.bytesLeft()); //primitiveBytesLeft
                case 113: return this.primitiveQuit(argCount);
                case 114: return this.primitiveExitToDebugger(argCount);
                case 115: return this.primitiveChangeClass(argCount);
                case 116: return this.vm.flushMethodCacheForMethod(this.vm.top());  // after Squeak 2.2 uses 119
                case 117: return this.doNamedPrimitive(argCount, primMethod); // named prims
                case 118: return this.primitiveDoPrimitiveWithArgs(argCount);
                case 119: return this.vm.flushMethodCacheForSelector(this.vm.top()); // before Squeak 2.3 uses 116
                // Miscellaneous Primitives (120-149)
                case 120: this.vm.warnOnce("missing primitive:121 (primitiveCalloutToFFI)"); return false;
                case 121: return this.primitiveImageName(argCount); //get+set imageName
                case 122: return this.primitiveReverseDisplay(argCount); // Blue Book: primitiveImageVolume
                case 123: this.vm.warnOnce("missing primitive: 123 (primitiveValueUninterruptably)"); return false;
                case 124: return this.popNandPushIfOK(2, this.registerSemaphore(Squeak.splOb_TheLowSpaceSemaphore));
                case 125: return this.popNandPushIfOK(2, this.setLowSpaceThreshold());
                case 126: return this.primitiveDeferDisplayUpdates(argCount);
                case 127: return this.primitiveShowDisplayRect(argCount);
                case 128: return this.primitiveArrayBecome(argCount, true, true); // both ways, do copy hash
                case 129: return this.popNandPushIfOK(1, this.vm.image.specialObjectsArray); //specialObjectsOop
                case 130: return this.primitiveFullGC(argCount);
                case 131: return this.primitivePartialGC(argCount);
                case 132: return this.pop2andPushBoolIfOK(this.pointsTo(this.stackNonInteger(1), this.vm.top())); //Object.pointsTo
                case 133: return this.popNIfOK(argCount); //TODO primitiveSetInterruptKey
                case 134: return this.popNandPushIfOK(2, this.registerSemaphore(Squeak.splOb_TheInterruptSemaphore));
                case 135: return this.popNandPushIfOK(1, this.millisecondClockValue());
                case 136: return this.primitiveSignalAtMilliseconds(argCount); //Delay signal:atMs:();
                case 137: return this.popNandPushIfOK(1, this.secondClock()); // seconds since Jan 1, 1901
                case 138: return this.popNandPushIfOK(argCount+1, this.someObject()); // Object.someObject
                case 139: return this.popNandPushIfOK(argCount+1, this.nextObject(this.vm.top())); // Object.nextObject
                case 140: return this.primitiveBeep(argCount);
                case 141: return this.primitiveClipboardText(argCount);
                case 142: return this.popNandPushIfOK(argCount+1, this.makeStString(this.filenameToSqueak(Squeak.vmPath)));
                case 143: // short at and shortAtPut
                case 144: return this.primitiveShortAtAndPut(argCount);
                case 145: return this.primitiveConstantFill(argCount);
                case 146: return this.namedPrimitive('JoystickTabletPlugin', 'primitiveReadJoystick', argCount);
                case 147: return this.namedPrimitive('BitBltPlugin', 'primitiveWarpBits', argCount);
                case 148: return this.popNandPushIfOK(argCount+1, this.vm.image.clone(this.vm.top())); //shallowCopy
                case 149: return this.primitiveGetAttribute(argCount);
                // File Primitives (150-169)
                case 150: if (this.oldPrims) return this.primitiveFileAtEnd(argCount);
                case 151: if (this.oldPrims) return this.primitiveFileClose(argCount);
                case 152: if (this.oldPrims) return this.primitiveFileGetPosition(argCount);
                case 153: if (this.oldPrims) return this.primitiveFileOpen(argCount);
                case 154: if (this.oldPrims) return this.primitiveFileRead(argCount);
                case 155: if (this.oldPrims) return this.primitiveFileSetPosition(argCount);
                case 156: if (this.oldPrims) return this.primitiveFileDelete(argCount);
                case 157: if (this.oldPrims) return this.primitiveFileSize(argCount);
                    break;  // fail 150-157 if fell through
                case 158: if (this.oldPrims) return this.primitiveFileWrite(argCount);
                    else this.vm.warnOnce("missing primitive: 158 (primitiveCompareWith)"); return false;
                case 159: if (this.oldPrims) return this.primitiveFileRename(argCount);
                    return this.popNandPushIntIfOK(argCount+1, this.stackSigned53BitInt(0) * 1664525 & 0xFFFFFFF); // primitiveHashMultiply
                case 160: if (this.oldPrims) return this.primitiveDirectoryCreate(argCount);
                    else return this.primitiveAdoptInstance(argCount);
                case 161: if (this.oldPrims) return this.primitiveDirectoryDelimitor(argCount);
                    this.vm.warnOnce("missing primitive: 161 (primitiveSetIdentityHash)"); return false;
                case 162: if (this.oldPrims) return this.primitiveDirectoryLookup(argCount);
                    break;  // fail
                case 163: if (this.oldPrims) return this.primitiveDirectoryDelete(argCount);
                    else this.vm.warnOnce("missing primitive: 163 (primitiveGetImmutability)"); return false;
                case 164: return this.popNandPushIfOK(argCount+1, this.vm.trueObj); // Fake primitiveSetImmutability
                case 165:
                case 166: return this.primitiveIntegerAtAndPut(argCount);
                case 167: return false; // Processor.yield
                case 168: return this.primitiveCopyObject(argCount);
                case 169: if (this.oldPrims) return this.primitiveDirectorySetMacTypeAndCreator(argCount);
                    else return this.pop2andPushBoolIfOK(this.vm.stackValue(1) !== this.vm.stackValue(0)); //new: primitiveNotIdentical
                // Sound Primitives (170-199)
                case 170: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundStart', argCount);
                    else return this.primitiveAsCharacter(argCount);
                case 171: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundStartWithSemaphore', argCount);
                    else return this.popNandPushIfOK(argCount+1, this.stackNonInteger(0).hash); //primitiveImmediateAsInteger
                case 172: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundStop', argCount);
                    this.vm.warnOnce("missing primitive: 172 (primitiveFetchMourner)");
                    return this.popNandPushIfOK(argCount, this.vm.nilObj); // do not fail
                case 173: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundAvailableSpace', argCount);
                    else return this.popNandPushIfOK(argCount+1, this.objectAt(false,false,true)); // slotAt:
                case 174: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundPlaySamples', argCount);
                    else return this.popNandPushIfOK(argCount+1, this.objectAtPut(false,false,true)); // slotAt:put:
                case 175: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundPlaySilence', argCount);
                    else return this.popNandPushIfOK(argCount+1, this.behaviorHash(this.stackNonInteger(0)));
                case 176: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primWaveTableSoundmixSampleCountintostartingAtpan', argCount);
                    break;  // fail
                case 177: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primFMSoundmixSampleCountintostartingAtpan', argCount);
                    return this.popNandPushIfOK(argCount+1, this.allInstancesOf(this.stackNonInteger(0)));
                case 178: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primPluckedSoundmixSampleCountintostartingAtpan', argCount);
                    return false; // allObjectsDo fallback code is just as fast and uses less memory
                case 179: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primSampledSoundmixSampleCountintostartingAtpan', argCount);
                    break;  // fail
                case 180: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primitiveMixFMSound', argCount);
                    return false; // growMemoryByAtLeast
                case 181: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primitiveMixPluckedSound', argCount);
                    return this.primitiveSizeInBytesOfInstance(argCount);
                case 182: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'oldprimSampledSoundmixSampleCountintostartingAtleftVolrightVol', argCount);
                    return this.primitiveSizeInBytes(argCount);
                case 183: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primitiveApplyReverb', argCount);
                    break;  // fail
                case 184: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primitiveMixLoopedSampledSound', argCount);
                    break; // fail
                case 185: if (this.oldPrims) return this.namedPrimitive('SoundGenerationPlugin', 'primitiveMixSampledSound', argCount);
                    else return this.primitiveExitCriticalSection(argCount);
                case 186: if (this.oldPrims) break; // unused
                    else return this.primitiveEnterCriticalSection(argCount);
                case 187: if (this.oldPrims) break; // unused
                    else return this.primitiveTestAndSetOwnershipOfCriticalSection(argCount);
                case 188: if (this.oldPrims) break; // unused
                    else return this.primitiveExecuteMethodArgsArray(argCount);
                case 189: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundInsertSamples', argCount);
                    return false; // fail to fall back to primitiveExecuteMethodArgsArray (188)
                case 190: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundStartRecording', argCount);
                case 191: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundStopRecording', argCount);
                case 192: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundGetRecordingSampleRate', argCount);
                case 193: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundRecordSamples', argCount);
                case 194: if (this.oldPrims) return this.namedPrimitive('SoundPlugin', 'primitiveSoundSetRecordLevel', argCount);
                    break;  // fail 190-194 if fell through
                case 195: return false; // Context.findNextUnwindContextUpTo:
                case 196: return false; // Context.terminateTo:
                case 197: return false; // Context.findNextHandlerContextStarting
                case 198: return false; // MarkUnwindMethod (must fail)
                case 199: return false; // MarkHandlerMethod (must fail)
                // Networking Primitives (200-229)
                case 200: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveInitializeNetwork', argCount);
                    else return this.primitiveClosureCopyWithCopiedValues(argCount);
                case 201: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverStartNameLookup', argCount);
                    else return this.primitiveClosureValue(argCount);
                case 202: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverNameLookupResult', argCount);
                    else return this.primitiveClosureValue(argCount);
                case 203: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverStartAddressLookup', argCount);
                    else return this.primitiveClosureValue(argCount);
                case 204: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverAddressLookupResult', argCount);
                    else return this.primitiveClosureValue(argCount);
                case 205: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverAbortLookup', argCount);
                    else return this.primitiveClosureValue(argCount);
                case 206: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverLocalAddress', argCount);
                    else return  this.primitiveClosureValueWithArgs(argCount);
                case 207: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverStatus', argCount);
                    else return this.primitiveFullClosureValue(argCount);
                case 208: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveResolverError', argCount);
                    else return this.primitiveFullClosureValueWithArgs(argCount);
                case 209: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketCreate', argCount);
                    else return this.primitiveFullClosureValueNoContextSwitch(argCount);
                case 210: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketDestroy', argCount);
                    else return this.popNandPushIfOK(2, this.objectAt(false,false,false)); // contextAt:
                case 211: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketConnectionStatus', argCount);
                    else return this.popNandPushIfOK(3, this.objectAtPut(false,false,false)); // contextAt:put:
                case 212: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketError', argCount);
                    else return this.popNandPushIfOK(1, this.objectSize(false)); // contextSize
                case 213: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketLocalAddress', argCount);
                case 214: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketLocalPort', argCount);
                case 215: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketRemoteAddress', argCount);
                case 216: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketRemotePort', argCount);
                case 217: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketConnectToPort', argCount);
                case 218: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketListenOnPort', argCount);
                case 219: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketCloseConnection', argCount);
                case 220: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketAbortConnection', argCount);
                    break;  // fail 212-220 if fell through
                case 221: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketReceiveDataBufCount', argCount);
                    else return this.primitiveClosureValueNoContextSwitch(argCount);
                case 222: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketReceiveDataAvailable', argCount);
                    else return this.primitiveClosureValueNoContextSwitch(argCount);
                case 223: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketSendDataBufCount', argCount);
                case 224: if (this.oldPrims) return this.namedPrimitive('SocketPlugin', 'primitiveSocketSendDone', argCount);
                    break;  // fail 223-229 if fell through
                // 225-229: unused
                // Other Primitives (230-249)
                case 230: return this.primitiveRelinquishProcessorForMicroseconds(argCount);
                case 231: return this.primitiveForceDisplayUpdate(argCount);
                case 232: this.vm.warnOnce("missing primitive: 232 (primitiveFormPrint)"); return false;
                case 233: return this.primitiveSetFullScreen(argCount);
                case 234: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveDecompressFromByteArray', argCount);
                case 235: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveCompareString', argCount);
                case 236: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveConvert8BitSigned', argCount);
                case 237: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveCompressToByteArray', argCount);
                case 238: if (this.oldPrims) return this.namedPrimitive('SerialPlugin', 'primitiveSerialPortOpen', argCount);
                case 239: if (this.oldPrims) return this.namedPrimitive('SerialPlugin', 'primitiveSerialPortClose', argCount);
                    break;  // fail 234-239 if fell through
                case 240: if (this.oldPrims) return this.namedPrimitive('SerialPlugin', 'primitiveSerialPortWrite', argCount);
                    else return this.popNandPushIfOK(1, this.microsecondClockUTC());
                case 241: if (this.oldPrims) return this.namedPrimitive('SerialPlugin', 'primitiveSerialPortRead', argCount);
                    else return this.popNandPushIfOK(1, this.microsecondClockLocal());
                case 242: if (this.oldPrims) break; // unused
                    else return this.primitiveSignalAtUTCMicroseconds(argCount);
                case 243: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveTranslateStringWithTable', argCount);
                    else this.vm.warnOnce("missing primitive: 243 (primitiveUpdateTimeZone)"); return false;
                case 244: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveFindFirstInString' , argCount);
                case 245: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveIndexOfAsciiInString', argCount);
                case 246: if (this.oldPrims) return this.namedPrimitive('MiscPrimitivePlugin', 'primitiveFindSubstring', argCount);
                    break;  // fail 243-246 if fell through
                // 247: unused
                case 248: return this.primitiveArrayBecome(argCount, false, false); // one way, do not copy hash
                case 249: return this.primitiveArrayBecome(argCount, false, true); // one way, opt. copy hash
                case 254: return this.primitiveVMParameter(argCount);
                //MIDI Primitives (520-539)
                case 521: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIClosePort', argCount);
                case 522: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIGetClock', argCount);
                case 523: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIGetPortCount', argCount);
                case 524: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIGetPortDirectionality', argCount);
                case 525: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIGetPortName', argCount);
                case 526: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIOpenPort', argCount);
                case 527: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIParameterGetOrSet', argCount);
                case 528: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIRead', argCount);
                case 529: return this.namedPrimitive('MIDIPlugin', 'primitiveMIDIWrite', argCount);
                // 530-539: reserved for extended MIDI primitives
                // Sound Codec Primitives
                case 550: return this.namedPrimitive('ADPCMCodecPlugin', 'primitiveDecodeMono', argCount);
                case 551: return this.namedPrimitive('ADPCMCodecPlugin', 'primitiveDecodeStereo', argCount);
                case 552: return this.namedPrimitive('ADPCMCodecPlugin', 'primitiveEncodeMono', argCount);
                case 553: return this.namedPrimitive('ADPCMCodecPlugin', 'primitiveEncodeStereo', argCount);
                // External primitive support primitives (570-574)
                // case 570: return this.primitiveFlushExternalPrimitives(argCount);
                case 571: return this.primitiveUnloadModule(argCount);
                case 572: return this.primitiveListBuiltinModule(argCount);
                case 573: return this.primitiveListLoadedModule(argCount);
                case 575: this.vm.warnOnce("missing primitive: 575 (primitiveHighBit)"); return false;
                // this is not really a primitive, see findSelectorInClass()
                case 576: return this.vm.primitiveInvokeObjectAsMethod(argCount, primMethod);
            }
            console.error("primitive " + index + " not implemented yet");
            return false;
        },
        namedPrimitive: function(modName, functionName, argCount) {
            // duplicated in loadFunctionFrom()
            var mod = modName === "" ? this : this.loadedModules[modName];
            if (mod === undefined) { // null if earlier load failed
                mod = this.loadModule(modName);
                this.loadedModules[modName] = mod;
            }
            var result = false;
            var sp = this.vm.sp;
            if (mod) {
                this.interpreterProxy.argCount = argCount;
                var primitive = mod[functionName];
                if (typeof primitive === "function") {
                    result = mod[functionName](argCount);
                } else if (typeof primitive === "string") {
                    // allow late binding for built-ins
                    result = this[primitive](argCount);
                } else {
                    this.vm.warnOnce("missing primitive: " + modName + "." + functionName);
                }
            } else {
                this.vm.warnOnce("missing module: " + modName + " (" + functionName + ")");
            }
            if ((result === true || (result !== false && this.success)) && this.vm.sp !== sp - argCount && !this.vm.frozen) {
                this.vm.warnOnce("stack unbalanced after primitive " + modName + "." + functionName, "error");
            }
            if (result === true || result === false) return result;
            return this.success;
        },
        doNamedPrimitive: function(argCount, primMethod) {
            if (primMethod.pointersSize() < 2) return false;
            var firstLiteral = primMethod.pointers[1]; // skip method header
            if (firstLiteral.pointersSize() !== 4) return false;
            this.primMethod = primMethod;
            var moduleName = firstLiteral.pointers[0].bytesAsString();
            var functionName = firstLiteral.pointers[1].bytesAsString();
            return this.namedPrimitive(moduleName, functionName, argCount);
        },
        fakePrimitive: function(prim, retVal, argCount) {
            // fake a named primitive
            // prim and retVal need to be curried when used:
            //  this.fakePrimitive.bind(this, "Module.primitive", 42)
            this.vm.warnOnce("faking primitive: " + prim);
            if (retVal === undefined) this.vm.popN(argCount);
            else this.vm.popNandPush(argCount+1, this.makeStObject(retVal));
            return true;
        },
    },
    'modules', {
        loadModule: function(modName) {
            var mod = Squeak.externalModules[modName] || this.builtinModules[modName] || this.loadModuleDynamically(modName);
            if (!mod) return null;
            if (this.patchModules[modName])
                this.patchModule(mod, modName);
            if (mod.setInterpreter) {
                if (!mod.setInterpreter(this.interpreterProxy)) {
                    console.log("Wrong interpreter proxy version: " + modName);
                    return null;
                }
            }
            var initFunc = mod.initialiseModule;
            if (typeof initFunc === 'function') {
                mod.initialiseModule();
            } else if (typeof initFunc === 'string') {
                // allow late binding for built-ins
                this[initFunc]();
            }
            if (this.interpreterProxy.failed()) {
                console.log("Module initialization failed: " + modName);
                return null;
            }
            console.log("Loaded module: " + modName);
            return mod;
        },
        loadModuleDynamically: function(modName) {
            // Placeholder (can be replaced by a module loader at runtime, before starting the Squeak interpreter)
            return undefined;
        },
        patchModule: function(mod, modName) {
            var patch = this.patchModules[modName];
            for (var key in patch)
                mod[key] = patch[key];
        },
        unloadModule: function(modName) {
            var mod = this.loadedModules[modName];
            if (!modName || !mod|| mod === this) return null;
            delete this.loadedModules[modName];
            var unloadFunc = mod.unloadModule;
            if (typeof unloadFunc === 'function') {
                mod.unloadModule(this);
            } else if (typeof unloadFunc === 'string') {
                // allow late binding for built-ins
                this[unloadFunc](this);
            }
            console.log("Unloaded module: " + modName);
            return mod;
        },
        loadFunctionFrom: function(functionName, modName) {
            // copy of namedPrimitive() returning the bound function instead of calling it
            var mod = modName === "" ? this : this.loadedModules[modName];
            if (mod === undefined) { // null if earlier load failed
                mod = this.loadModule(modName);
                this.loadedModules[modName] = mod;
            }
            if (!mod) return null;
            var func = mod[functionName];
            if (typeof func === "function") {
                return func.bind(mod);
            } else if (typeof func === "string") {
                return (this[func]).bind(this);
            }
            this.vm.warnOnce("missing primitive: " + modName + "." + functionName);
            return null;
        },
        primitiveUnloadModule: function(argCount) {
            var moduleName = this.stackNonInteger(0).bytesAsString();
            if (!moduleName) return false;
            this.unloadModule(moduleName);
            return this.popNIfOK(argCount);
        },
        primitiveListBuiltinModule: function(argCount) {
            var index = this.stackInteger(0) - 1;
            if (!this.success) return false;
            var moduleNames = Object.keys(this.builtinModules);
            return this.popNandPushIfOK(argCount + 1, this.makeStObject(moduleNames[index]));
        },
        primitiveListLoadedModule: function(argCount) {
            var index = this.stackInteger(0) - 1;
            if (!this.success) return false;
            var moduleNames = [];
            for (var key in this.loadedModules) {
                var module = this.loadedModules[key];
                if (module) {
                    var moduleName = module.getModuleName ? module.getModuleName() : key;
                    moduleNames.push(moduleName);
                }
            }
            return this.popNandPushIfOK(argCount + 1, this.makeStObject(moduleNames[index]));
        },
    },
    'stack access', {
        popNIfOK: function(nToPop) {
            if (!this.success) return false;
            this.vm.popN(nToPop);
            return true;
        },
        pop2andPushBoolIfOK: function(bool) {
            this.vm.success = this.success;
            return this.vm.pop2AndPushBoolResult(bool);
        },
        popNandPushIfOK: function(nToPop, returnValue) {
            if (!this.success || returnValue == null) return false;
            this.vm.popNandPush(nToPop, returnValue);
            return true;
        },
        popNandPushIntIfOK: function(nToPop, returnValue) {
            if (!this.success || !this.vm.canBeSmallInt(returnValue)) return false;
            return this.popNandPushIfOK(nToPop, returnValue);
        },
        popNandPushFloatIfOK: function(nToPop, returnValue) {
            if (!this.success) return false;
            return this.popNandPushIfOK(nToPop, this.makeFloat(returnValue));
        },
        stackNonInteger: function(nDeep) {
            return this.checkNonInteger(this.vm.stackValue(nDeep));
        },
        stackInteger: function(nDeep) {
            return this.checkSmallInt(this.vm.stackValue(nDeep));
        },
        stackPos32BitInt: function(nDeep) {
            return this.positive32BitValueOf(this.vm.stackValue(nDeep));
        },
        pos32BitIntFor: function(signed32) {
            // Return the 32-bit quantity as an unsigned 32-bit integer
            if (signed32 >= 0 && signed32 <= Squeak.MaxSmallInt) return signed32;
            var lgIntClass = this.vm.specialObjects[Squeak.splOb_ClassLargePositiveInteger],
                lgIntObj = this.vm.instantiateClass(lgIntClass, 4),
                bytes = lgIntObj.bytes;
            for (var i=0; i<4; i++)
                bytes[i] = (signed32>>>(8*i)) & 255;
            return lgIntObj;
        },
        pos53BitIntFor: function(longlong) {
            // Return the quantity as an unsigned 64-bit integer
            if (longlong <= 0xFFFFFFFF) return this.pos32BitIntFor(longlong);
            if (longlong > 0x1FFFFFFFFFFFFF) {
                console.warn("Out of range: pos53BitIntFor(" + longlong + ")");
                this.success = false;
                return 0;
            }        var sz = longlong <= 0xFFFFFFFFFF ? 5 :
                     longlong <= 0xFFFFFFFFFFFF ? 6 :
                     7;
            var lgIntClass = this.vm.specialObjects[Squeak.splOb_ClassLargePositiveInteger],
                lgIntObj = this.vm.instantiateClass(lgIntClass, sz),
                bytes = lgIntObj.bytes;
            for (var i = 0; i < sz; i++) {
                bytes[i] = longlong & 255;
                longlong /= 256;
            }
            return lgIntObj;
        },
        stackSigned32BitInt: function(nDeep) {
            var stackVal = this.vm.stackValue(nDeep);
            if (typeof stackVal === "number") {   // SmallInteger
                return stackVal;
            }
            if (stackVal.bytesSize() !== 4) {
                this.success = false;
                return 0;
            }
            var bytes = stackVal.bytes,
                value = 0;
            for (var i = 0, f = 1; i < 4; i++, f *= 256)
                value += bytes[i] * f;
            if (this.isA(stackVal, Squeak.splOb_ClassLargePositiveInteger) && value <= 0x7FFFFFFF)
                return value;
            if (this.isA(stackVal, Squeak.splOb_ClassLargeNegativeInteger) && -value >= -0x80000000)
                return -value;
            this.success = false;
            return 0;
        },
        signed32BitIntegerFor: function(signed32) {
            // Return the 32-bit quantity as a signed 32-bit integer
            if (signed32 >= Squeak.MinSmallInt && signed32 <= Squeak.MaxSmallInt) return signed32;
            var negative = signed32 < 0,
                unsigned = negative ? -signed32 : signed32,
                lgIntClass = negative ? Squeak.splOb_ClassLargeNegativeInteger : Squeak.splOb_ClassLargePositiveInteger,
                lgIntObj = this.vm.instantiateClass(this.vm.specialObjects[lgIntClass], 4),
                bytes = lgIntObj.bytes;
            for (var i=0; i<4; i++)
                bytes[i] = (unsigned>>>(8*i)) & 255;
            return lgIntObj;
        },
        stackFloat: function(nDeep) {
            return this.checkFloat(this.vm.stackValue(nDeep));
        },
        stackBoolean: function(nDeep) {
            return this.checkBoolean(this.vm.stackValue(nDeep));
        },
        stackSigned53BitInt:function(nDeep) {
            var stackVal = this.vm.stackValue(nDeep);
            if (typeof stackVal === "number") {   // SmallInteger
                return stackVal;
            }
            var n = stackVal.bytesSize();
            if (n <= 7) {
                var bytes = stackVal.bytes,
                    value = 0;
                for (var i = 0, f = 1; i < n; i++, f *= 256)
                    value += bytes[i] * f;
                if (value <= 0x1FFFFFFFFFFFFF) {
                    if (this.isA(stackVal, Squeak.splOb_ClassLargePositiveInteger))
                        return value;
                    if (this.isA(stackVal, Squeak.splOb_ClassLargeNegativeInteger))
                        return -value;
                }
            }
            this.success = false;
            return 0;
        },
    },
    'numbers', {
        doBitAnd: function() {
            var rcvr = this.stackPos32BitInt(1);
            var arg = this.stackPos32BitInt(0);
            if (!this.success) return 0;
            return this.pos32BitIntFor(rcvr & arg);
        },
        doBitOr: function() {
            var rcvr = this.stackPos32BitInt(1);
            var arg = this.stackPos32BitInt(0);
            if (!this.success) return 0;
            return this.pos32BitIntFor(rcvr | arg);
        },
        doBitXor: function() {
            var rcvr = this.stackPos32BitInt(1);
            var arg = this.stackPos32BitInt(0);
            if (!this.success) return 0;
            return this.pos32BitIntFor(rcvr ^ arg);
        },
        doBitShift: function() {
            var rcvr = this.stackPos32BitInt(1);
            var arg = this.stackInteger(0);
            if (!this.success) return 0;
            var result = this.vm.safeShift(rcvr, arg); // returns negative result if failed
            if (result > 0)
                return this.pos32BitIntFor(this.vm.safeShift(rcvr, arg));
            this.success = false;
            return 0;
        },
        safeFDiv: function(dividend, divisor) {
            if (divisor === 0.0) {
                this.success = false;
                return 1.0;
            }
            return dividend / divisor;
        },
        floatAsSmallInt: function(float) {
            var truncated = float >= 0 ? Math.floor(float) : Math.ceil(float);
            return this.ensureSmallInt(truncated);
        },
        floatFractionPart: function(float) {
            if (-9007199254740991 /* -((1 << 53) - 1) */ <= float && float <= 9007199254740991 /* (1 << 53) - 1 */) {
                return float - Math.floor(float);
            } else {
                this.success = false;
                return 0;
            }
        },
        frexp_exponent: function(value) {
            // frexp separates a float into its mantissa and exponent
            if (value == 0.0) return 0;     // zero is special
            var data = new DataView(new ArrayBuffer(8));
            data.setFloat64(0, value);      // for accessing IEEE-754 exponent bits
            var bits = (data.getUint32(0) >>> 20) & 0x7FF;
            if (bits === 0) { // we have a subnormal float (actual zero was handled above)
                // make it normal by multiplying a large number
                data.setFloat64(0, value * Math.pow(2, 64));
                // access its exponent bits, and subtract the large number's exponent
                bits = ((data.getUint32(0) >>> 20) & 0x7FF) - 64;
            }
            var exponent = bits - 1022;                 // apply bias
            // mantissa = this.ldexp(value, -exponent)  // not needed for Squeak
            return exponent;
        },
        ldexp: function(mantissa, exponent) {
            // construct a float as mantissa * 2 ^ exponent
            // avoid multiplying by Infinity and Zero and rounding errors
            // by splitting the exponent (thanks to Nicolas Cellier)
            // 3 multiplies needed for e.g. ldexp(5e-324, 1023+1074)
            var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
            var result = mantissa;
            for (var i = 0; i < steps; i++)
                result *= Math.pow(2, Math.floor((exponent + i) / steps));
            return result;
        },
        primitiveLessThanLargeIntegers: function() {
            return this.pop2andPushBoolIfOK(this.stackSigned53BitInt(1) < this.stackSigned53BitInt(0));
        },
        primitiveGreaterThanLargeIntegers: function() {
            return this.pop2andPushBoolIfOK(this.stackSigned53BitInt(1) > this.stackSigned53BitInt(0));
        },
        primitiveLessOrEqualLargeIntegers: function() {
            return this.pop2andPushBoolIfOK(this.stackSigned53BitInt(1) <= this.stackSigned53BitInt(0));
        },
        primitiveGreaterOrEqualLargeIntegers: function() {
            return this.pop2andPushBoolIfOK(this.stackSigned53BitInt(1) >= this.stackSigned53BitInt(0));
        },
        primitiveEqualLargeIntegers: function() {
            return this.pop2andPushBoolIfOK(this.stackSigned53BitInt(1) === this.stackSigned53BitInt(0));
        },
        primitiveNotEqualLargeIntegers: function() {
            return this.pop2andPushBoolIfOK(this.stackSigned53BitInt(1) !== this.stackSigned53BitInt(0));
        },
    },
    'utils', {
        floatOrInt: function(obj) {
            if (obj.isFloat) return obj.float;
            if (typeof obj === "number") return obj;  // SmallInteger
            return 0;
        },
        positive32BitValueOf: function(obj) {
            if (typeof obj === "number") { // SmallInteger
                if (obj >= 0)
                    return obj;
                this.success = false;
                return 0;
            }
            if (!this.isA(obj, Squeak.splOb_ClassLargePositiveInteger) || obj.bytesSize() !== 4) {
                this.success = false;
                return 0;
            }
            var bytes = obj.bytes,
                value = 0;
            for (var i = 0, f = 1; i < 4; i++, f *= 256)
                value += bytes[i] * f;
            return value;
        },
        checkFloat: function(maybeFloat) { // returns a number and sets success
            if (maybeFloat.isFloat)
                return maybeFloat.float;
            if (typeof maybeFloat === "number")  // SmallInteger
                return maybeFloat;
            this.success = false;
            return 0.0;
        },
        checkSmallInt: function(maybeSmall) { // returns an int and sets success
            if (typeof maybeSmall === "number")
                return maybeSmall;
            this.success = false;
            return 0;
        },
        checkNonInteger: function(obj) { // returns a SqObj and sets success
            if (typeof obj !== "number")
                return obj;
            this.success = false;
            return this.vm.nilObj;
        },
        checkBoolean: function(obj) { // returns true/false and sets success
            if (obj.isTrue) return true;
            if (obj.isFalse) return false;
            return this.success = false;
        },
        indexableSize: function(obj) {
            if (typeof obj === "number") return -1; // -1 means not indexable
            return obj.indexableSize(this);
        },
        isA: function(obj, knownClass) {
            return obj.sqClass === this.vm.specialObjects[knownClass];
        },
        isKindOf: function(obj, knownClass) {
            var classOrSuper = obj.sqClass;
            var theClass = this.vm.specialObjects[knownClass];
            while (!classOrSuper.isNil) {
                if (classOrSuper === theClass) return true;
                classOrSuper = classOrSuper.pointers[Squeak.Class_superclass];
            }
            return false;
        },
        isAssociation: function(obj) {
            return typeof obj !== "number" && obj.pointersSize() == 2;
        },
        ensureSmallInt: function(number) {
            if (number === (number|0) && this.vm.canBeSmallInt(number))
                return number;
            this.success = false;
            return 0;
        },
        charFromInt: function(ascii) {
            var charTable = this.vm.specialObjects[Squeak.splOb_CharacterTable];
            var char = charTable.pointers[ascii];
            if (char) return char;
            var charClass = this.vm.specialObjects[Squeak.splOb_ClassCharacter];
            char = this.vm.instantiateClass(charClass, 0);
            char.pointers[0] = ascii;
            return char;
        },
        charFromIntSpur: function(unicode) {
            return this.vm.image.getCharacter(unicode);
        },
        charToInt: function(obj) {
            return obj.pointers[0];
        },
        charToIntSpur: function(obj) {
            return obj.hash;
        },
        makeFloat: function(value) {
            var floatClass = this.vm.specialObjects[Squeak.splOb_ClassFloat];
            var newFloat = this.vm.instantiateClass(floatClass, 2);
            newFloat.float = value;
            return newFloat;
        },
        makeLargeIfNeeded: function(integer) {
            return this.vm.canBeSmallInt(integer) ? integer : this.makeLargeInt(integer);
        },
        makeLargeInt: function(integer) {
            if (integer < 0) throw Error("negative large ints not implemented yet");
            if (integer > 0xFFFFFFFF) throw Error("large large ints not implemented yet");
            return this.pos32BitIntFor(integer);
        },
        makePointWithXandY: function(x, y) {
            var pointClass = this.vm.specialObjects[Squeak.splOb_ClassPoint];
            var newPoint = this.vm.instantiateClass(pointClass, 0);
            newPoint.pointers[Squeak.Point_x] = x;
            newPoint.pointers[Squeak.Point_y] = y;
            return newPoint;
        },
        makeStArray: function(jsArray, proxyClass) {
            var array = this.vm.instantiateClass(this.vm.specialObjects[Squeak.splOb_ClassArray], jsArray.length);
            for (var i = 0; i < jsArray.length; i++)
                array.pointers[i] = this.makeStObject(jsArray[i], proxyClass);
            return array;
        },
        makeStByteArray: function(jsArray) {
            var array = this.vm.instantiateClass(this.vm.specialObjects[Squeak.splOb_ClassByteArray], jsArray.length);
            for (var i = 0; i < jsArray.length; i++)
                array.bytes[i] = jsArray[i] & 0xff;
            return array;
        },
        makeStString: function(jsString) {
            var stString = this.vm.instantiateClass(this.vm.specialObjects[Squeak.splOb_ClassString], jsString.length);
            for (var i = 0; i < jsString.length; ++i)
                stString.bytes[i] = jsString.charCodeAt(i) & 0xFF;
            return stString;
        },
        makeStObject: function(obj, proxyClass) {
            if (obj === undefined || obj === null) return this.vm.nilObj;
            if (obj === true) return this.vm.trueObj;
            if (obj === false) return this.vm.falseObj;
            if (obj.sqClass) return obj;
            if (typeof obj === "number")
                if (obj === (obj|0)) return this.makeLargeIfNeeded(obj);
                else return this.makeFloat(obj);
            if (proxyClass) {   // wrap in JS proxy instance
                var stObj = this.vm.instantiateClass(proxyClass, 0);
                stObj.jsObject = obj;
                return stObj;
            }
            // A direct test of the buffer's constructor doesn't work on Safari 10.0.
            if (typeof obj === "string" || obj.constructor.name === "Uint8Array") return this.makeStString(obj);
            if (obj.constructor.name === "Array") return this.makeStArray(obj);
            throw Error("cannot make smalltalk object");
        },
        pointsTo: function(rcvr, arg) {
            if (!rcvr.pointers) return false;
            return rcvr.pointers.indexOf(arg) >= 0;
        },
        asUint8Array: function(buffer) {
            // A direct test of the buffer's constructor doesn't work on Safari 10.0.
            if (buffer.constructor.name === "Uint8Array") return buffer;
            if (buffer.constructor.name === "ArrayBuffer") return new Uint8Array(buffer);
            if (typeof buffer === "string") {
                var array = new Uint8Array(buffer.length);
                for (var i = 0; i < buffer.length; i++)
                    array[i] = buffer.charCodeAt(i);
                return array;
            }
            throw Error("unknown buffer type");
        },
        filenameToSqueak: function(unixpath) {
            var slash = unixpath[0] !== "/" ? "/" : "",
                filepath = "/SqueakJS" + slash + unixpath;                      // add SqueakJS
            if (this.emulateMac)
                filepath = ("Macintosh HD" + filepath)                          // add Mac volume
                    .replace(/\//g, "€").replace(/:/g, "/").replace(/€/g, ":"); // substitute : for /
            return filepath;
        },
        filenameFromSqueak: function(filepath) {
            var unixpath = !this.emulateMac ? filepath :
                filepath.replace(/^[^:]*:/, ":")                            // remove volume
                .replace(/\//g, "€").replace(/:/g, "/").replace(/€/g, ":"); // substitute : for /
            unixpath = unixpath.replace(/^\/*SqueakJS\/?/, "/");            // strip SqueakJS /**/
            return unixpath;
        },
    },
    'indexing', {
        objectAt: function(cameFromBytecode, convertChars, includeInstVars) {
            //Returns result of at: or sets success false
            var array = this.stackNonInteger(1);
            var index = this.stackPos32BitInt(0); //note non-int returns zero
            if (!this.success) return array;
            var info;
            if (cameFromBytecode) {// fast entry checks cache
                info = this.atCache[array.hash & this.atCacheMask];
                if (info.array !== array) {this.success = false; return array;}
            } else {// slow entry installs in cache if appropriate
                if (array.isFloat) { // present float as word array
                    var floatData = array.floatData();
                    if (index==1) return this.pos32BitIntFor(floatData.getUint32(0, false));
                    if (index==2) return this.pos32BitIntFor(floatData.getUint32(4, false));
                    this.success = false; return array;
                }
                info = this.makeAtCacheInfo(this.atCache, this.vm.specialSelectors[32], array, convertChars, includeInstVars);
            }
            if (index < 1 || index > info.size) {this.success = false; return array;}
            if (includeInstVars)  //pointers...   instVarAt and objectAt
                return array.pointers[index-1];
            if (array.isPointers())   //pointers...   normal at:
                return array.pointers[index-1+info.ivarOffset];
            if (array.isWords()) // words...
                if (info.convertChars) return this.charFromInt(array.words[index-1] & 0x3FFFFFFF);
                else return this.pos32BitIntFor(array.words[index-1]);
            if (array.isBytes()) // bytes...
                if (info.convertChars) return this.charFromInt(array.bytes[index-1] & 0xFF);
                else return array.bytes[index-1] & 0xFF;
            // methods must simulate Squeak's method indexing
            var offset = array.pointersSize() * 4;
            if (index-1-offset < 0) {this.success = false; return array;} //reading lits as bytes
            return array.bytes[index-1-offset] & 0xFF;
        },
        objectAtPut: function(cameFromBytecode, convertChars, includeInstVars) {
            //Returns result of at:put: or sets success false
            var array = this.stackNonInteger(2);
            var index = this.stackPos32BitInt(1); //note non-int returns zero
            if (!this.success) return array;
            var info;
            if (cameFromBytecode) {// fast entry checks cache
                info = this.atPutCache[array.hash & this.atCacheMask];
                if (info.array !== array) {this.success = false; return array;}
            } else {// slow entry installs in cache if appropriate
                if (array.isFloat) { // present float as word array
                    var wordToPut = this.stackPos32BitInt(0);
                    if (this.success && (index == 1 || index == 2)) {
                        var floatData = array.floatData();
                        floatData.setUint32(index == 1 ? 0 : 4, wordToPut, false);
                        array.float = floatData.getFloat64(0);
                    } else this.success = false;
                    return this.vm.stackValue(0);
                }
                info = this.makeAtCacheInfo(this.atPutCache, this.vm.specialSelectors[34], array, convertChars, includeInstVars);
            }
            if (index<1 || index>info.size) {this.success = false; return array;}
            var objToPut = this.vm.stackValue(0);
            if (includeInstVars)  {// pointers...   instVarAtPut and objectAtPut
                array.dirty = true;
                return array.pointers[index-1] = objToPut; //eg, objectAt:
            }
            if (array.isPointers())  {// pointers...   normal atPut
                array.dirty = true;
                return array.pointers[index-1+info.ivarOffset] = objToPut;
            }
            var intToPut;
            if (array.isWords()) {  // words...
                if (convertChars) {
                    // put a character...
                    if (objToPut.sqClass !== this.vm.specialObjects[Squeak.splOb_ClassCharacter])
                        {this.success = false; return objToPut;}
                    intToPut = this.charToInt(objToPut);
                    if (typeof intToPut !== "number") {this.success = false; return objToPut;}
                } else {
                    intToPut = this.stackPos32BitInt(0);
                }
                if (this.success) array.words[index-1] = intToPut;
                return objToPut;
            }
            // bytes...
            if (convertChars) {
                // put a character...
                if (objToPut.sqClass !== this.vm.specialObjects[Squeak.splOb_ClassCharacter])
                    {this.success = false; return objToPut;}
                intToPut = this.charToInt(objToPut);
                if (typeof intToPut !== "number") {this.success = false; return objToPut;}
            } else { // put a byte...
                if (typeof objToPut !== "number") {this.success = false; return objToPut;}
                intToPut = objToPut;
            }
            if (intToPut<0 || intToPut>255) {this.success = false; return objToPut;}
            if (array.isBytes())  // bytes...
                {array.bytes[index-1] = intToPut; return objToPut;}
            // methods must simulate Squeak's method indexing
            var offset = array.pointersSize() * 4;
            if (index-1-offset < 0) {this.success = false; return array;} //writing lits as bytes
            array.bytes[index-1-offset] = intToPut;
            return objToPut;
        },
        objectSize: function(cameFromBytecode) {
            var rcvr = this.vm.stackValue(0),
                size = -1;
            if (cameFromBytecode) {
                // must only handle classes with size == basicSize, fail otherwise
                if (rcvr.sqClass === this.vm.specialObjects[Squeak.splOb_ClassArray]) {
                    size = rcvr.pointersSize();
                } else if (rcvr.sqClass === this.vm.specialObjects[Squeak.splOb_ClassString]) {
                    size = rcvr.bytesSize();
                }
            } else { // basicSize
                size = this.indexableSize(rcvr);
            }
            if (size === -1) {this.success = false; return -1}        return this.pos32BitIntFor(size);
        },
        initAtCache: function() {
            // The purpose of the at-cache is to allow fast (bytecode) access to at/atput code
            // without having to check whether this object has overridden at, etc.
            this.atCacheSize = 32; // must be power of 2
            this.atCacheMask = this.atCacheSize - 1; //...so this is a mask
            this.atCache = [];
            this.atPutCache = [];
            this.nonCachedInfo = {};
            for (var i= 0; i < this.atCacheSize; i++) {
                this.atCache.push({});
                this.atPutCache.push({});
            }
        },
        makeAtCacheInfo: function(atOrPutCache, atOrPutSelector, array, convertChars, includeInstVars) {
            //Make up an info object and store it in the atCache or the atPutCache.
            //If it's not cacheable (not a non-super send of at: or at:put:)
            //then return the info in nonCachedInfo.
            //Note that info for objectAt (includeInstVars) will have
            //a zero ivarOffset, and a size that includes the extra instVars
            var info;
            var cacheable =
                (this.vm.verifyAtSelector === atOrPutSelector)         //is at or atPut
                && (this.vm.verifyAtClass === array.sqClass)           //not a super send
                && !this.vm.isContext(array);                          //not a context (size can change)
            info = cacheable ? atOrPutCache[array.hash & this.atCacheMask] : this.nonCachedInfo;
            info.array = array;
            info.convertChars = convertChars;
            if (includeInstVars) {
                info.size = array.instSize() + Math.max(0, array.indexableSize(this));
                info.ivarOffset = 0;
            } else {
                info.size = array.indexableSize(this);
                info.ivarOffset = array.isPointers() ? array.instSize() : 0;
            }
            return info;
        },
    },
    'basic',{
        instantiateClass: function(clsObj, indexableSize) {
            if (indexableSize * 4 > this.vm.image.bytesLeft()) {
                // we're not really out of memory, we have no idea how much memory is available
                // but we need to stop runaway allocations
                console.warn("squeak: out of memory");
                this.success = false;
                this.vm.primFailCode = Squeak.PrimErrNoMemory;
                return null;
            } else {
                return this.vm.instantiateClass(clsObj, indexableSize);
            }
        },
        someObject: function() {
            return this.vm.image.firstOldObject;
        },
        nextObject: function(obj) {
            return this.vm.image.objectAfter(obj) || 0;
        },
        someInstanceOf: function(clsObj) {
            var someInstance = this.vm.image.someInstanceOf(clsObj);
            if (someInstance) return someInstance;
            this.success = false;
            return 0;
        },
        nextInstanceAfter: function(obj) {
            var nextInstance = this.vm.image.nextInstanceAfter(obj);
            if (nextInstance) return nextInstance;
            this.success = false;
            return 0;
        },
        allInstancesOf: function(clsObj) {
            var instances = this.vm.image.allInstancesOf(clsObj);
            var array = this.vm.instantiateClass(this.vm.specialObjects[Squeak.splOb_ClassArray], instances.length);
            array.pointers = instances;
            return array;
        },
        identityHash: function(obj) {
            return obj.hash;
        },
        identityHashSpur: function(obj) {
            var hash = obj.hash;
            if (hash > 0) return hash;
            return obj.hash = this.newObjectHash();
        },
        behaviorHash: function(obj) {
            var hash = obj.hash;
            if (hash > 0) return hash;
            return this.vm.image.enterIntoClassTable(obj);
        },
        newObjectHash: function(obj) {
            return Math.floor(Math.random() * 0x3FFFFE) + 1;
        },
        primitiveSizeInBytesOfInstance: function(argCount) {
            if (argCount > 1) return false;
            var classObj = this.stackNonInteger(argCount),
                nElements = argCount ? this.stackInteger(0) : 0,
                bytes = classObj.classByteSizeOfInstance(nElements);
            return this.popNandPushIfOK(argCount + 1, this.makeLargeIfNeeded(bytes));
        },
        primitiveSizeInBytes: function(argCount) {
            var object = this.stackNonInteger(0),
                bytes = object.totalBytes();
            return this.popNandPushIfOK(argCount + 1, this.makeLargeIfNeeded(bytes));
        },
        primitiveAsCharacter: function(argCount) {
            var unicode = this.stackInteger(0);
            if (unicode < 0 || unicode > 0x3FFFFFFF) return false;
            var char = this.charFromInt(unicode);
            if (!char) return false;
            return this.popNandPushIfOK(argCount + 1, char);
        },
        primitiveFullGC: function(argCount) {
            this.vm.image.fullGC("primitive");
            var bytes = this.vm.image.bytesLeft();
            return this.popNandPushIfOK(1, this.makeLargeIfNeeded(bytes));
        },
        primitivePartialGC: function(argCount) {
            this.vm.image.partialGC("primitive");
            var bytes = this.vm.image.bytesLeft();
            return this.popNandPushIfOK(1, this.makeLargeIfNeeded(bytes));
        },
        primitiveMakePoint: function(argCount, checkNumbers) {
            var x = this.vm.stackValue(1);
            var y = this.vm.stackValue(0);
            if (checkNumbers) {
                this.checkFloat(x);
                this.checkFloat(y);
                if (!this.success) return false;
            }
            this.vm.popNandPush(1+argCount, this.makePointWithXandY(x, y));
            return true;
        },
        primitiveStoreStackp: function(argCount) {
            var ctxt = this.stackNonInteger(1),
                newStackp = this.stackInteger(0);
            if (!this.success || newStackp < 0 || this.vm.decodeSqueakSP(newStackp) >= ctxt.pointers.length)
                return false;
            var stackp = ctxt.pointers[Squeak.Context_stackPointer];
            while (stackp < newStackp)
                ctxt.pointers[this.vm.decodeSqueakSP(++stackp)] = this.vm.nilObj;
            ctxt.pointers[Squeak.Context_stackPointer] = newStackp;
            this.vm.popN(argCount);
            return true;
        },
        primitiveChangeClass: function(argCount) {
            if (argCount > 2) return false;
            var rcvr = this.stackNonInteger(1),
                arg = this.stackNonInteger(0);
            if (!this.changeClassTo(rcvr, arg.sqClass)) {
                return false;
            }
            return this.popNIfOK(argCount);
        },
        primitiveAdoptInstance: function(argCount) {
            if (argCount > 2) return false;
            var cls = this.stackNonInteger(1),
                obj = this.stackNonInteger(0);
            if (!this.changeClassTo(obj, cls)) {
                return false;
            }
            return this.popNIfOK(argCount);
        },
        changeClassTo: function(rcvr, cls) {
            if (rcvr.sqClass.isCompact !== cls.isCompact) return false;
            var classInstIsPointers = cls.classInstIsPointers();
            if (rcvr.isPointers()) {
                if (!classInstIsPointers) return false;
                if (rcvr.sqClass.classInstSize() !== cls.classInstSize())
                    return false;
            } else {
                if (classInstIsPointers) return false;
                var hasBytes = rcvr.isBytes(),
                    needBytes = cls.classInstIsBytes();
                if (hasBytes && !needBytes) {
                    if (rcvr.bytes) {
                        if (rcvr.bytes.length & 3) return false;
                        rcvr.words = new Uint32Array(rcvr.bytes.buffer);
                        delete rcvr.bytes;
                    }
                } else if (!hasBytes && needBytes) {
                    if (rcvr.words) {
                        rcvr.bytes = new Uint8Array(rcvr.words.buffer);
                        delete rcvr.words;
                    }
                }
            }
            rcvr._format = cls.classInstFormat();
            rcvr.sqClass = cls;
            return true;
        },
        primitiveDoPrimitiveWithArgs: function(argCount) {
            var argumentArray = this.stackNonInteger(0),
                primIdx = this.stackInteger(1);
            if (!this.success) return false;
            var arraySize = argumentArray.pointersSize(),
                cntxSize = this.vm.activeContext.pointersSize();
            if (this.vm.sp + arraySize >= cntxSize) return false;
            // Pop primIndex and argArray, then push args in place...
            this.vm.popN(2);
            for (var i = 0; i < arraySize; i++)
                this.vm.push(argumentArray.pointers[i]);
            // Run the primitive
            if (this.vm.tryPrimitive(primIdx, arraySize))
                return true;
            // Primitive failed, restore state for failure code
            this.vm.popN(arraySize);
            this.vm.push(primIdx);
            this.vm.push(argumentArray);
            return false;
        },
        primitiveShortAtAndPut: function(argCount) {
            var rcvr = this.stackNonInteger(argCount),
                index = this.stackInteger(argCount-1) - 1, // make zero-based
                array = rcvr.wordsAsInt16Array();
            if (!this.success || !array || index < 0 || index >= array.length)
                return false;
            var value;
            if (argCount < 2) { // shortAt:
                value = array[index];
            } else { // shortAt:put:
                value = this.stackInteger(0);
                if (value < -32768 || value > 32767)
                    return false;
                array[index] = value;
            }
            this.popNandPushIfOK(argCount+1, value);
            return true;
        },
        primitiveIntegerAtAndPut:  function(argCount) {
            var rcvr = this.stackNonInteger(argCount),
                index = this.stackInteger(argCount-1) - 1, // make zero-based
                array = rcvr.wordsAsInt32Array();
            if (!this.success || !array || index < 0 || index >= array.length)
                return false;
            var value;
            if (argCount < 2) { // integerAt:
                value = this.signed32BitIntegerFor(array[index]);
            } else { // integerAt:put:
                value = this.stackSigned32BitInt(0);
                if (!this.success)
                    return false;
                array[index] = value;
            }
            this.popNandPushIfOK(argCount+1, value);
            return true;
        },
        primitiveConstantFill:  function(argCount) {
            var rcvr = this.stackNonInteger(1),
                value = this.stackPos32BitInt(0);
            if (!this.success || !rcvr.isWordsOrBytes())
                return false;
            var array = rcvr.words || rcvr.bytes;
            if (array) {
                if (array === rcvr.bytes && value > 255)
                    return false;
                for (var i = 0; i < array.length; i++)
                    array[i] = value;
            }
            this.vm.popN(argCount);
            return true;
        },
        primitiveNewMethod: function(argCount) {
            var header = this.stackInteger(0);
            var bytecodeCount = this.stackInteger(1);
            if (!this.success) return 0;
            var method = this.vm.instantiateClass(this.vm.stackValue(2), bytecodeCount);
            method.pointers = [header];
            var litCount = method.methodNumLits();
            for (var i = 0; i < litCount; i++)
                method.pointers.push(this.vm.nilObj);
            this.vm.popNandPush(1+argCount, method);
            if (this.vm.breakOnNewMethod)               // break on doit
                this.vm.breakOnMethod = method;
            return true;
        },
        primitiveExecuteMethodArgsArray: function(argCount) {
            // receiver, argsArray, then method are on top of stack.  Execute method with
            // receiver and args.
            var methodObj = this.stackNonInteger(0),
                argsArray = this.stackNonInteger(1),
                receiver = this.vm.stackValue(2);
            // Allow for up to two extra arguments (e.g. for mirror primitives).
            if (!this.success || !methodObj.isMethod() || argCount > 4) return false;
            var numArgs = methodObj.methodNumArgs();
            if (numArgs !== argsArray.pointersSize()) return false;
            // drop all args, push receiver, and new arguments
            this.vm.popNandPush(argCount+1, receiver);
            for (var i = 0; i < numArgs; i++)
                this.vm.push(argsArray.pointers[i]);
            this.vm.executeNewMethod(receiver, methodObj, numArgs, methodObj.methodPrimitiveIndex(), null, null);
            return true;
        },
        primitiveArrayBecome: function(argCount, doBothWays, copyHash) {
            var rcvr = this.stackNonInteger(argCount),
                arg = this.stackNonInteger(argCount-1);
            if (argCount > 1) copyHash = this.stackBoolean(argCount-2);
            if (!this.success) return false;
            this.success = this.vm.image.bulkBecome(rcvr.pointers, arg.pointers, doBothWays, copyHash);
            return this.popNIfOK(argCount);
        },
        doStringReplace: function() {
            var dst = this.stackNonInteger(4);
            var dstPos = this.stackInteger(3) - 1;
            var count = this.stackInteger(2) - dstPos;
            var src = this.stackNonInteger(1);
            var srcPos = this.stackInteger(0) - 1;
            if (!this.success) return dst; //some integer not right
            if (!src.sameFormatAs(dst)) {this.success = false; return dst;} //incompatible formats
            if (src.isPointers()) {//pointer type objects
                var totalLength = src.pointersSize();
                var srcInstSize = src.instSize();
                srcPos += srcInstSize;
                if ((srcPos < 0) || (srcPos + count) > totalLength)
                    {this.success = false; return dst;} //would go out of bounds
                totalLength = dst.pointersSize();
                var dstInstSize= dst.instSize();
                dstPos += dstInstSize;
                if ((dstPos < 0) || (dstPos + count) > totalLength)
                    {this.success= false; return dst;} //would go out of bounds
                for (var i = 0; i < count; i++)
                    dst.pointers[dstPos + i] = src.pointers[srcPos + i];
                return dst;
            } else if (src.isWords()) { //words type objects
                var totalLength = src.wordsSize();
                if ((srcPos < 0) || (srcPos + count) > totalLength)
                    {this.success = false; return dst;} //would go out of bounds
                totalLength = dst.wordsSize();
                if ((dstPos < 0) || (dstPos + count) > totalLength)
                    {this.success = false; return dst;} //would go out of bounds
                if (src.isFloat && dst.isFloat)
                    dst.float = src.float;
                else if (src.isFloat)
                    dst.wordsAsFloat64Array()[dstPos] = src.float;
                else if (dst.isFloat)
                    dst.float = src.wordsAsFloat64Array()[srcPos];
                else for (var i = 0; i < count; i++)
                    dst.words[dstPos + i] = src.words[srcPos + i];
                return dst;
            } else { //bytes type objects
                var totalLength = src.bytesSize();
                if ((srcPos < 0) || (srcPos + count) > totalLength)
                    {this.success = false; return dst;} //would go out of bounds
                totalLength = dst.bytesSize();
                if ((dstPos < 0) || (dstPos + count) > totalLength)
                    {this.success = false; return dst;} //would go out of bounds
                for (var i = 0; i < count; i++)
                    dst.bytes[dstPos + i] = src.bytes[srcPos + i];
                return dst;
            }
        },
        primitiveCopyObject: function(argCount) {
            var rcvr = this.stackNonInteger(1),
                arg = this.stackNonInteger(0),
                length = rcvr.pointersSize();
            if (!this.success ||
                rcvr.isWordsOrBytes() ||
                rcvr.sqClass !== arg.sqClass ||
                length !== arg.pointersSize()) return false;
            for (var i = 0; i < length; i++)
                rcvr.pointers[i] = arg.pointers[i];
            rcvr.dirty = arg.dirty;
            this.vm.popN(argCount);
            return true;
        },
        primitiveLoadImageSegment: function(argCount) {
            var segmentWordArray = this.stackNonInteger(1),
                outPointerArray = this.stackNonInteger(0);
            if (!segmentWordArray.words || !outPointerArray.pointers) return false;
            var roots = this.vm.image.loadImageSegment(segmentWordArray, outPointerArray);
            if (!roots) return false;
            return this.popNandPushIfOK(argCount + 1, roots);
        },
    },
    'blocks/closures', {
        doBlockCopy: function() {
            var rcvr = this.vm.stackValue(1);
            var sqArgCount = this.stackInteger(0);
            var homeCtxt = rcvr;
            if(!this.vm.isContext(homeCtxt)) this.success = false;
            if(!this.success) return rcvr;
            if (typeof homeCtxt.pointers[Squeak.Context_method] === "number")
                // ctxt is itself a block; get the context for its enclosing method
                homeCtxt = homeCtxt.pointers[Squeak.BlockContext_home];
            var blockSize = homeCtxt.pointersSize() - homeCtxt.instSize(); // could use a const for instSize
            var newBlock = this.vm.instantiateClass(this.vm.specialObjects[Squeak.splOb_ClassBlockContext], blockSize);
            var initialPC = this.vm.encodeSqueakPC(this.vm.pc + 2, this.vm.method); //*** check this...
            newBlock.pointers[Squeak.BlockContext_initialIP] = initialPC;
            newBlock.pointers[Squeak.Context_instructionPointer] = initialPC; // claim not needed; value will set it
            newBlock.pointers[Squeak.Context_stackPointer] = 0;
            newBlock.pointers[Squeak.BlockContext_argumentCount] = sqArgCount;
            newBlock.pointers[Squeak.BlockContext_home] = homeCtxt;
            newBlock.pointers[Squeak.Context_sender] = this.vm.nilObj; // claim not needed; just initialized
            return newBlock;
        },
        primitiveBlockValue: function(argCount) {
            var rcvr = this.vm.stackValue(argCount);
            if (!this.isA(rcvr, Squeak.splOb_ClassBlockContext)) return false;
            var block = rcvr;
            var blockArgCount = block.pointers[Squeak.BlockContext_argumentCount];
            if (typeof blockArgCount !== "number") return false;
            if (blockArgCount != argCount) return false;
            if (!block.pointers[Squeak.BlockContext_caller].isNil) return false;
            this.vm.arrayCopy(this.vm.activeContext.pointers, this.vm.sp-argCount+1, block.pointers, Squeak.Context_tempFrameStart, argCount);
            var initialIP = block.pointers[Squeak.BlockContext_initialIP];
            block.pointers[Squeak.Context_instructionPointer] = initialIP;
            block.pointers[Squeak.Context_stackPointer] = argCount;
            block.pointers[Squeak.BlockContext_caller] = this.vm.activeContext;
            this.vm.popN(argCount+1);
            this.vm.newActiveContext(block);
            if (this.vm.interruptCheckCounter-- <= 0) this.vm.checkForInterrupts(); // jit compile block method
            return true;
        },
        primitiveBlockValueWithArgs: function(argCount) {
            var block = this.vm.stackValue(1);
            var array = this.vm.stackValue(0);
            if (!this.isA(block, Squeak.splOb_ClassBlockContext)) return false;
            if (!this.isA(array, Squeak.splOb_ClassArray)) return false;
            var blockArgCount = block.pointers[Squeak.BlockContext_argumentCount];
            if (typeof blockArgCount !== "number") return false;
            if (blockArgCount != array.pointersSize()) return false;
            if (!block.pointers[Squeak.BlockContext_caller].isNil) return false;
            this.vm.arrayCopy(array.pointers, 0, block.pointers, Squeak.Context_tempFrameStart, blockArgCount);
            var initialIP = block.pointers[Squeak.BlockContext_initialIP];
            block.pointers[Squeak.Context_instructionPointer] = initialIP;
            block.pointers[Squeak.Context_stackPointer] = blockArgCount;
            block.pointers[Squeak.BlockContext_caller] = this.vm.activeContext;
            this.vm.popN(argCount+1);
            this.vm.newActiveContext(block);
            if (this.vm.interruptCheckCounter-- <= 0) this.vm.checkForInterrupts(); // jit compile block method
            return true;
        },
        primitiveClosureCopyWithCopiedValues: function(argCount) {
            this.vm.breakNow("primitiveClosureCopyWithCopiedValues");
            debugger;
            return false;
        },
        primitiveClosureValue: function(argCount) {
            var blockClosure = this.vm.stackValue(argCount),
                blockArgCount = blockClosure.pointers[Squeak.Closure_numArgs];
            if (argCount !== blockArgCount) return false;
            return this.activateNewClosureMethod(blockClosure, argCount);
        },
        primitiveClosureValueWithArgs: function(argCount) {
            var array = this.vm.top(),
                arraySize = array.pointersSize(),
                blockClosure = this.vm.stackValue(argCount),
                blockArgCount = blockClosure.pointers[Squeak.Closure_numArgs];
            if (arraySize !== blockArgCount) return false;
            this.vm.pop();
            for (var i = 0; i < arraySize; i++)
                this.vm.push(array.pointers[i]);
            return this.activateNewClosureMethod(blockClosure, arraySize);
        },
        primitiveClosureValueNoContextSwitch: function(argCount) {
            return this.primitiveClosureValue(argCount);
        },
        primitiveFullClosureValue: function(argCount) {
            var blockClosure = this.vm.stackValue(argCount),
                blockArgCount = blockClosure.pointers[Squeak.Closure_numArgs];
            if (argCount !== blockArgCount) return false;
            return this.activateNewFullClosure(blockClosure, argCount);
        },
        primitiveFullClosureValueWithArgs: function(argCount) {
            var array = this.vm.top(),
                arraySize = array.pointersSize(),
                blockClosure = this.vm.stackValue(argCount),
                blockArgCount = blockClosure.pointers[Squeak.Closure_numArgs];
            if (arraySize !== blockArgCount) return false;
            this.vm.pop();
            for (var i = 0; i < arraySize; i++)
                this.vm.push(array.pointers[i]);
            return this.activateNewFullClosure(blockClosure, arraySize);
        },
        primitiveFullClosureValueNoContextSwitch: function(argCount) {
            return this.primitiveFullClosureValue(argCount);
        },
        activateNewClosureMethod: function(blockClosure, argCount) {
            var outerContext = blockClosure.pointers[Squeak.Closure_outerContext],
                method = outerContext.pointers[Squeak.Context_method],
                newContext = this.vm.allocateOrRecycleContext(method.methodNeedsLargeFrame()),
                numCopied = blockClosure.pointers.length - Squeak.Closure_firstCopiedValue;
            newContext.pointers[Squeak.Context_sender] = this.vm.activeContext;
            newContext.pointers[Squeak.Context_instructionPointer] = blockClosure.pointers[Squeak.Closure_startpc];
            newContext.pointers[Squeak.Context_stackPointer] = argCount + numCopied;
            newContext.pointers[Squeak.Context_method] = outerContext.pointers[Squeak.Context_method];
            newContext.pointers[Squeak.Context_closure] = blockClosure;
            newContext.pointers[Squeak.Context_receiver] = outerContext.pointers[Squeak.Context_receiver];
            // Copy the arguments and copied values ...
            var where = Squeak.Context_tempFrameStart;
            for (var i = 0; i < argCount; i++)
                newContext.pointers[where++] = this.vm.stackValue(argCount - i - 1);
            for (var i = 0; i < numCopied; i++)
                newContext.pointers[where++] = blockClosure.pointers[Squeak.Closure_firstCopiedValue + i];
            // The initial instructions in the block nil-out remaining temps.
            this.vm.popN(argCount + 1);
            this.vm.newActiveContext(newContext);
            return true;
        },
        activateNewFullClosure: function(blockClosure, argCount) {
            var closureMethod = blockClosure.pointers[Squeak.ClosureFull_method],
                newContext = this.vm.allocateOrRecycleContext(closureMethod.methodNeedsLargeFrame()),
                numCopied = blockClosure.pointers.length - Squeak.ClosureFull_firstCopiedValue;
            newContext.pointers[Squeak.Context_sender] = this.vm.activeContext;
            newContext.pointers[Squeak.Context_instructionPointer] = this.vm.encodeSqueakPC(0, closureMethod);
            newContext.pointers[Squeak.Context_stackPointer] = closureMethod.methodTempCount(); // argCount + numCopied + numActualTemps
            newContext.pointers[Squeak.Context_method] = closureMethod;
            newContext.pointers[Squeak.Context_closure] = blockClosure;
            newContext.pointers[Squeak.Context_receiver] = blockClosure.pointers[Squeak.ClosureFull_receiver];
            // Copy the arguments and copied values ...
            var where = Squeak.Context_tempFrameStart;
            for (var i = 0; i < argCount; i++)
                newContext.pointers[where++] = this.vm.stackValue(argCount - i - 1);
            for (var i = 0; i < numCopied; i++)
                newContext.pointers[where++] = blockClosure.pointers[Squeak.ClosureFull_firstCopiedValue + i];
            // No need to nil-out remaining temps as context pointers are nil-initialized.
            this.vm.popN(argCount + 1);
            this.vm.newActiveContext(newContext);
            return true;
        },
    },
    'scheduling', {
        primitiveResume: function() {
            this.resume(this.vm.top());
            return true;
        },
        primitiveSuspend: function() {
            var process = this.vm.top();
            if (process === this.activeProcess()) {
                this.vm.popNandPush(1, this.vm.nilObj);
                this.transferTo(this.wakeHighestPriority());
            } else {
                var oldList = process.pointers[Squeak.Proc_myList];
                if (oldList.isNil) return false;
                this.removeProcessFromList(process, oldList);
                if (!this.success) return false;
                process.pointers[Squeak.Proc_myList] = this.vm.nilObj;
                this.vm.popNandPush(1, oldList);
            }
            return true;
        },
        getScheduler: function() {
            var assn = this.vm.specialObjects[Squeak.splOb_SchedulerAssociation];
            return assn.pointers[Squeak.Assn_value];
        },
        activeProcess: function() {
            return this.getScheduler().pointers[Squeak.ProcSched_activeProcess];
        },
        resume: function(newProc) {
            var activeProc = this.activeProcess();
            var activePriority = activeProc.pointers[Squeak.Proc_priority];
            var newPriority = newProc.pointers[Squeak.Proc_priority];
            if (newPriority > activePriority) {
                this.putToSleep(activeProc);
                this.transferTo(newProc);
            } else {
                this.putToSleep(newProc);
            }
        },
        putToSleep: function(aProcess) {
            //Save the given process on the scheduler process list for its priority.
            var priority = aProcess.pointers[Squeak.Proc_priority];
            var processLists = this.getScheduler().pointers[Squeak.ProcSched_processLists];
            var processList = processLists.pointers[priority - 1];
            this.linkProcessToList(aProcess, processList);
        },
        transferTo: function(newProc) {
            //Record a process to be awakened on the next interpreter cycle.
            var sched = this.getScheduler();
            var oldProc = sched.pointers[Squeak.ProcSched_activeProcess];
            sched.pointers[Squeak.ProcSched_activeProcess] = newProc;
            sched.dirty = true;
            oldProc.pointers[Squeak.Proc_suspendedContext] = this.vm.activeContext;
            oldProc.dirty = true;
            this.vm.newActiveContext(newProc.pointers[Squeak.Proc_suspendedContext]);
            newProc.pointers[Squeak.Proc_suspendedContext] = this.vm.nilObj;
            this.vm.reclaimableContextCount = 0;
            if (this.vm.breakOnContextChanged) {
                this.vm.breakOnContextChanged = false;
                this.vm.breakNow();
            }
        },
        wakeHighestPriority: function() {
            //Return the highest priority process that is ready to run.
            //Note: It is a fatal VM error if there is no runnable process.
            var schedLists = this.getScheduler().pointers[Squeak.ProcSched_processLists];
            var p = schedLists.pointersSize() - 1;  // index of last indexable field
            var processList;
            do {
                if (p < 0) throw Error("scheduler could not find a runnable process");
                processList = schedLists.pointers[p--];
            } while (this.isEmptyList(processList));
            return this.removeFirstLinkOfList(processList);
        },
        linkProcessToList: function(proc, aList) {
            // Add the given process to the given linked list and set the backpointer
            // of process to its new list.
            if (this.isEmptyList(aList)) {
                aList.pointers[Squeak.LinkedList_firstLink] = proc;
            } else {
                var lastLink = aList.pointers[Squeak.LinkedList_lastLink];
                lastLink.pointers[Squeak.Link_nextLink] = proc;
                lastLink.dirty = true;
            }
            aList.pointers[Squeak.LinkedList_lastLink] = proc;
            aList.dirty = true;
            proc.pointers[Squeak.Proc_myList] = aList;
            proc.dirty = true;
        },
        isEmptyList: function(aLinkedList) {
            return aLinkedList.pointers[Squeak.LinkedList_firstLink].isNil;
        },
        removeFirstLinkOfList: function(aList) {
            //Remove the first process from the given linked list.
            var first = aList.pointers[Squeak.LinkedList_firstLink];
            var last = aList.pointers[Squeak.LinkedList_lastLink];
            if (first === last) {
                aList.pointers[Squeak.LinkedList_firstLink] = this.vm.nilObj;
                aList.pointers[Squeak.LinkedList_lastLink] = this.vm.nilObj;
            } else {
                var next = first.pointers[Squeak.Link_nextLink];
                aList.pointers[Squeak.LinkedList_firstLink] = next;
                aList.dirty = true;
            }
            first.pointers[Squeak.Link_nextLink] = this.vm.nilObj;
            return first;
        },
        removeProcessFromList: function(process, list) {
            var first = list.pointers[Squeak.LinkedList_firstLink];
            var last = list.pointers[Squeak.LinkedList_lastLink];
            if (process === first) {
                var next = process.pointers[Squeak.Link_nextLink];
                list.pointers[Squeak.LinkedList_firstLink] = next;
                if (process === last) {
                    list.pointers[Squeak.LinkedList_lastLink] = this.vm.nilObj;
                }
            } else {
                var temp = first;
                while (true) {
                    if (temp.isNil) return this.success = false;
                    next = temp.pointers[Squeak.Link_nextLink];
                    if (next === process) break;
                    temp = next;
                }
                next = process.pointers[Squeak.Link_nextLink];
                temp.pointers[Squeak.Link_nextLink] = next;
                if (process === last) {
                    list.pointers[Squeak.LinkedList_lastLink] = temp;
                }
            }
            process.pointers[Squeak.Link_nextLink] = this.vm.nilObj;
        },
        registerSemaphore: function(specialObjIndex) {
            var sema = this.vm.top();
            if (this.isA(sema, Squeak.splOb_ClassSemaphore))
                this.vm.specialObjects[specialObjIndex] = sema;
            else
                this.vm.specialObjects[specialObjIndex] = this.vm.nilObj;
            return this.vm.stackValue(1);
        },
        primitiveWait: function() {
            var sema = this.vm.top();
            if (!this.isA(sema, Squeak.splOb_ClassSemaphore)) return false;
            var excessSignals = sema.pointers[Squeak.Semaphore_excessSignals];
            if (excessSignals > 0)
                sema.pointers[Squeak.Semaphore_excessSignals] = excessSignals - 1;
            else {
                this.linkProcessToList(this.activeProcess(), sema);
                this.transferTo(this.wakeHighestPriority());
            }
            return true;
        },
        primitiveSignal: function() {
            var sema = this.vm.top();
            if (!this.isA(sema, Squeak.splOb_ClassSemaphore)) return false;
            this.synchronousSignal(sema);
            return true;
        },
        synchronousSignal: function(sema) {
            if (this.isEmptyList(sema)) {
                // no process is waiting on this semaphore
                sema.pointers[Squeak.Semaphore_excessSignals]++;
            } else
                this.resume(this.removeFirstLinkOfList(sema));
            return;
        },
        signalAtMilliseconds: function(sema, msTime) {
            if (this.isA(sema, Squeak.splOb_ClassSemaphore)) {
                this.vm.specialObjects[Squeak.splOb_TheTimerSemaphore] = sema;
                this.vm.nextWakeupTick = msTime;
            } else {
                this.vm.specialObjects[Squeak.splOb_TheTimerSemaphore] = this.vm.nilObj;
                this.vm.nextWakeupTick = 0;
            }
        },
        primitiveSignalAtMilliseconds: function(argCount) {
            var msTime = this.stackInteger(0);
            var sema = this.stackNonInteger(1);
            if (!this.success) return false;
            this.signalAtMilliseconds(sema, msTime);
            this.vm.popN(argCount); // return self
            return true;
        },
        primitiveSignalAtUTCMicroseconds: function(argCount) {
            var usecsUTC = this.stackSigned53BitInt(0);
            var sema = this.stackNonInteger(1);
            if (!this.success) return false;
            var msTime = (usecsUTC / 1000 + Squeak.EpochUTC - this.vm.startupTime) & Squeak.MillisecondClockMask;
            this.signalAtMilliseconds(sema, msTime);
            this.vm.popN(argCount); // return self
            return true;
        },
        signalSemaphoreWithIndex: function(semaIndex) {
            // asynch signal: will actually be signaled in checkForInterrupts()
            this.semaphoresToSignal.push(semaIndex);
        },
        signalExternalSemaphores: function() {
            var semaphores = this.vm.specialObjects[Squeak.splOb_ExternalObjectsArray].pointers,
                semaClass = this.vm.specialObjects[Squeak.splOb_ClassSemaphore];
            while (this.semaphoresToSignal.length) {
                var semaIndex = this.semaphoresToSignal.shift(),
                    sema = semaphores[semaIndex - 1];
                if (sema.sqClass == semaClass)
                    this.synchronousSignal(sema);
            }
        },
        primitiveEnterCriticalSection: function(argCount) {
            if (argCount > 1) return false;
            var mutex = this.vm.stackValue(argCount);
            var activeProc = argCount ? this.vm.top() : this.activeProcess();
            var owningProcess = mutex.pointers[Squeak.Mutex_owner];
            if (owningProcess.isNil) {
                mutex.pointers[Squeak.Mutex_owner] = activeProc;
                mutex.dirty = true;
                this.popNandPushIfOK(argCount + 1, this.vm.falseObj);
            } else if (owningProcess === activeProc) {
                this.popNandPushIfOK(argCount + 1, this.vm.trueObj);
            } else {
                this.popNandPushIfOK(argCount + 1, this.vm.falseObj);
                this.linkProcessToList(activeProc, mutex);
                this.transferTo(this.wakeHighestPriority());
            }
            return true;
        },
        primitiveExitCriticalSection: function(argCount) {
            var criticalSection = this.vm.top();
            if (this.isEmptyList(criticalSection)) {
                criticalSection.pointers[Squeak.Mutex_owner] = this.vm.nilObj;
            } else {
                var owningProcess = this.removeFirstLinkOfList(criticalSection);
                criticalSection.pointers[Squeak.Mutex_owner] = owningProcess;
                criticalSection.dirty = true;
                this.resume(owningProcess);
            }
            return true;
        },
        primitiveTestAndSetOwnershipOfCriticalSection: function(argCount) {
            if (argCount > 1) return false;
            var mutex = this.vm.stackValue(argCount);
            var activeProc = argCount ? this.vm.top() : this.activeProcess();
            var owningProcess = mutex.pointers[Squeak.Mutex_owner];
            if (owningProcess.isNil) {
                mutex.pointers[Squeak.Mutex_owner] = activeProc;
                mutex.dirty = true;
                this.popNandPushIfOK(argCount + 1, this.vm.falseObj);
            } else if (owningProcess === activeProc) {
                this.popNandPushIfOK(argCount + 1, this.vm.trueObj);
            } else {
                this.popNandPushIfOK(argCount + 1, this.vm.nilObj);
            }
            return true;
        },
    },
    'vm functions', {
        primitiveGetAttribute: function(argCount) {
            var attr = this.stackInteger(0);
            if (!this.success) return false;
            var argv = this.display.argv,
                vmOptions = this.display.vmOptions,
                value = null;
            switch (attr) {
                case 0: value = (argv && argv[0]) || this.filenameToSqueak(Squeak.vmPath + Squeak.vmFile); break;
                case 1: value = (argv && argv[1]) || this.display.documentName; break; // 1.x images want document here
                case 2: value = (argv && argv[2]) || this.display.documentName; break; // later images want document here
                case 1001: value = Squeak.platformName; break;
                case 1002: value = Squeak.osVersion; break;
                case 1003: value = Squeak.platformSubtype; break;
                case 1004: value = Squeak.vmVersion + ' ' + Squeak.vmMakerVersion; break;
                case 1005: value = Squeak.windowSystem; break;
                case 1006: value = Squeak.vmBuild; break;
                case 1007: value = Squeak.vmVersion; break; // Interpreter class
                // case 1008: Cogit class
                case 1009: value = Squeak.vmVersion + ' Date: ' + Squeak.vmDate; break; // Platform source version
                default:
                    if (attr >= 0 && argv && argv.length > attr) {
                        value = argv[attr];
                    } else if (attr < 0 && vmOptions && vmOptions.length > -attr - 1) {
                        value = vmOptions[-attr - 1];
                    } else {
                        return false;
                    }
            }
            this.vm.popNandPush(argCount+1, this.makeStObject(value));
            return true;
        },
        setLowSpaceThreshold: function() {
            var nBytes = this.stackInteger(0);
            if (this.success) this.vm.lowSpaceThreshold = nBytes;
            return this.vm.stackValue(1);
        },
        primitiveVMParameter: function(argCount) {
            /* Behaviour depends on argument count:
            0 args: return an Array of VM parameter values;
            1 arg:  return the indicated VM parameter;
            2 args: set the VM indicated parameter. */
            var paramsArraySize = this.vm.image.isSpur ? 71 : 44;
            switch (argCount) {
                case 0:
                    var arrayObj = this.vm.instantiateClass(this.vm.specialObjects[Squeak.splOb_ClassArray], paramsArraySize);
                    for (var i = 0; i < paramsArraySize; i++)
                        arrayObj.pointers[i] = this.makeStObject(this.vmParameterAt(i+1));
                    return this.popNandPushIfOK(1, arrayObj);
                case 1:
                    var parm = this.stackInteger(0);
                    if (parm < 1 || parm > paramsArraySize) return false;
                    return this.popNandPushIfOK(2, this.makeStObject(this.vmParameterAt(parm)));
                case 2:
                    // ignore writes
                    return this.popNandPushIfOK(3, 0);
            }        return false;
        },
        vmParameterAt: function(index) {
            switch (index) {
                case 1: return this.vm.image.oldSpaceBytes;     // end of old-space (0-based, read-only)
                case 2: return this.vm.image.oldSpaceBytes;     // end of young-space (read-only)
                case 3: return this.vm.image.totalMemory;       // end of memory (read-only)
                case 4: return this.vm.image.allocationCount + this.vm.image.newSpaceCount; // allocationCount (read-only; nil in Cog VMs)
                // 5    allocations between GCs (read-write; nil in Cog VMs)
                // 6    survivor count tenuring threshold (read-write)
                case 7: return this.vm.image.gcCount;           // full GCs since startup (read-only)
                case 8: return this.vm.image.gcMilliseconds;    // total milliseconds in full GCs since startup (read-only)
                case 9: return this.vm.image.pgcCount;          // incremental GCs since startup (read-only)
                case 10: return this.vm.image.pgcMilliseconds;  // total milliseconds in incremental GCs since startup (read-only)
                case 11: return this.vm.image.gcTenured;        // tenures of surving objects since startup (read-only)
                // 12-20 specific to the translating VM
                case 15:
                case 16:                                        // idle microseconds
                case 17:
                case 18:
                case 19:
                case 20: return 0;                              // utc microseconds at VM start-up
                // 21   root table size (read-only)
                case 22: return 0;                              // root table overflows since startup (read-only)
                case 23: return this.vm.image.extraVMMemory;    // bytes of extra memory to reserve for VM buffers, plugins, etc.
                // 24   memory threshold above which to shrink object memory (read-write)
                // 25   memory headroom when growing object memory (read-write)
                // 26   interruptChecksEveryNms - force an ioProcessEvents every N milliseconds (read-write)
                // 27   number of times mark loop iterated for current IGC/FGC (read-only) includes ALL marking
                // 28   number of times sweep loop iterated for current IGC/FGC (read-only)
                // 29   number of times make forward loop iterated for current IGC/FGC (read-only)
                // 30   number of times compact move loop iterated for current IGC/FGC (read-only)
                // 31   number of grow memory requests (read-only)
                // 32   number of shrink memory requests (read-only)
                // 33   number of root table entries used for current IGC/FGC (read-only)
                // 34   number of allocations done before current IGC/FGC (read-only)
                // 35   number of survivor objects after current IGC/FGC (read-only)
                // 36   millisecond clock when current IGC/FGC completed (read-only)
                // 37   number of marked objects for Roots of the world, not including Root Table entries for current IGC/FGC (read-only)
                // 38   milliseconds taken by current IGC (read-only)
                // 39   Number of finalization signals for Weak Objects pending when current IGC/FGC completed (read-only)
                case 40: return 4; // BytesPerWord for this image
                case 41: return this.vm.image.formatVersion();
                //42    number of stack pages in use (Cog Stack VM only, otherwise nil)
                //43    desired number of stack pages (stored in image file header, max 65535; Cog VMs only, otherwise nil)
                case 44: return 0; // size of eden, in bytes
                // 45   desired size of eden, in bytes (stored in image file header; Cog VMs only, otherwise nil)
                // 46   size of machine code zone, in bytes (stored in image file header; Cog JIT VM only, otherwise nil)
                case 46: return 0;
                // 47   desired size of machine code zone, in bytes (applies at startup only, stored in image file header; Cog JIT VM only)
                case 48: return 0;
                // 48   various properties of the Cog VM as an integer encoding an array of bit flags.
                //      Bit 0: tells the VM that the image's Process class has threadId as its 5th inst var (after nextLink, suspendedContext, priority & myList)
                //      Bit 1: on Cog JIT VMs asks the VM to set the flag bit in interpreted methods
                //      Bit 2: if set, preempting a process puts it to the head of its run queue, not the back,
                //             i.e. preempting a process by a higher priority one will not cause the preempted process to yield
                //             to others at the same priority.
                //      Bit 3: in a muilt-threaded VM, if set, the Window system will only be accessed from the first VM thread
                //      Bit 4: in a Spur vm, if set, causes weaklings and ephemerons to be queued individually for finalization
                // 49   the size of the external semaphore table (read-write; Cog VMs only)
                // 50-51 reserved for VM parameters that persist in the image (such as eden above)
                // 52   root (remembered) table maximum size (read-only)
                // 53   the number of oldSpace segments (Spur only, otherwise nil)
                case 54: return this.vm.image.bytesLeft();  // total size of free old space (Spur only, otherwise nil)
                // 55   ratio of growth and image size at or above which a GC will be performed post scavenge (Spur only, otherwise nil)
                // 56   number of process switches since startup (read-only)
                // 57   number of ioProcessEvents calls since startup (read-only)
                // 58   number of forceInterruptCheck (Cog VMs) or quickCheckInterruptCalls (non-Cog VMs) calls since startup (read-only)
                // 59   number of check event calls since startup (read-only)
                // 60   number of stack page overflows since startup (read-only; Cog VMs only)
                // 61   number of stack page divorces since startup (read-only; Cog VMs only)
                // 62   number of machine code zone compactions since startup (read-only; Cog VMs only)
                // 63   milliseconds taken by machine code zone compactions since startup (read-only; Cog VMs only)
                // 64   current number of machine code methods (read-only; Cog VMs only)
                // 65   In newer Cog VMs a set of flags describing VM features,
                //      if non-zero bit 0 implies multiple bytecode set support;
                //      if non-zero bit 0 implies read-only object support
                //      (read-only; Cog VMs only; nil in older Cog VMs, a boolean answering multiple bytecode support in not so old Cog VMs)
                case 65: return 0;
                // 66   the byte size of a stack page in the stack zone  (read-only; Cog VMs only)
                // 67   the maximum allowed size of old space in bytes, 0 implies no internal limit (Spur VMs only).
                // 68 - 69 reserved for more Cog-related info
                // 70   the value of VM_PROXY_MAJOR (the interpreterProxy major version number)
                // 71   the value of VM_PROXY_MINOR (the interpreterProxy minor version number)"
            }
            return null;
        },
        primitiveImageName: function(argCount) {
            if (argCount == 0)
                return this.popNandPushIfOK(1, this.makeStString(this.filenameToSqueak(this.vm.image.name)));
            this.vm.image.name = this.filenameFromSqueak(this.vm.top().bytesAsString());
            Squeak.Settings['squeakImageName'] = this.vm.image.name;
            return true;
        },
        primitiveSnapshot: function(argCount) {
            this.vm.popNandPush(1, this.vm.trueObj);        // put true on stack for saved snapshot
            this.vm.storeContextRegisters();                // store current state for snapshot
            this.activeProcess().pointers[Squeak.Proc_suspendedContext] = this.vm.activeContext; // store initial context
            this.vm.image.fullGC("snapshot");               // before cleanup so traversal works
            var buffer = this.vm.image.writeToBuffer();
            // Write snapshot if files are supported
            if(Squeak.flushAllFiles) {
                Squeak.flushAllFiles();                         // so there are no more writes pending
                Squeak.filePut(this.vm.image.name, buffer);
            }
            this.vm.popNandPush(1, this.vm.falseObj);       // put false on stack for continuing
            return true;
        },
        primitiveQuit: function(argCount) {
            // Flush any files if files are supported
            if(Squeak.flushAllFiles)
                Squeak.flushAllFiles();
            this.display.quitFlag = true;
            this.vm.breakNow("quit");
            return true;
        },
        primitiveExitToDebugger: function(argCount) {
            this.vm.breakNow("debugger primitive");
            //console.error(this.vm.printStack(null));
            debugger;
            return true;
        },
        primitiveSetGCBiasToGrow: function(argCount) {
            return this.fakePrimitive(".primitiveSetGCBiasToGrow", 0, argCount);
        },
        primitiveSetGCBiasToGrowGCLimit: function(argCount) {
            return this.fakePrimitive(".primitiveSetGCBiasToGrowGCLimit", 0, argCount);
        },
    },
    'time', {
        primitiveRelinquishProcessorForMicroseconds: function(argCount) {
            // we ignore the optional arg
            this.vm.popN(argCount);
            this.vm.goIdle();        // might switch process, so must be after pop
            return true;
        },
        millisecondClockValue: function() {
            //Return the value of the millisecond clock as an integer.
            //Note that the millisecond clock wraps around periodically.
            //The range is limited to SmallInteger maxVal / 2 to allow
            //delays of up to that length without overflowing a SmallInteger.
            return (Date.now() - this.vm.startupTime) & Squeak.MillisecondClockMask;
        },
        millisecondClockValueSet: function(clock) {
            // set millisecondClock to the (previously saved) clock value
            // to allow "stopping" the VM clock while debugging
            this.vm.startupTime = Date.now() - clock;
        },
        secondClock: function() {
            return this.pos32BitIntFor(Squeak.totalSeconds()); // will overflow 32 bits in 2037
        },
        microsecondClock: function(state) {
            var millis = Date.now() - state.epoch;
            if (typeof performance !== "object")
                return this.pos53BitIntFor(millis * 1000);
            // use high-res clock, adjust for roll-over
            var micros = performance.now() * 1000 % 1000 | 0,
                oldMillis = state.millis,
                oldMicros = state.micros;
            if (oldMillis > millis) millis = oldMillis;                 // rolled over previously
            if (millis === oldMillis && micros < oldMicros) millis++;   // roll over now
            state.millis = millis;
            state.micros = micros;
            return this.pos53BitIntFor(millis * 1000 + micros);
        },
        microsecondClockUTC: function() {
            if (!this.microsecondClockUTCState)
                this.microsecondClockUTCState = {epoch: Squeak.EpochUTC, millis: 0, micros: 0};
            return this.microsecondClock(this.microsecondClockUTCState);
        },
        microsecondClockLocal: function() {
            if (!this.microsecondClockLocalState)
                this.microsecondClockLocalState = {epoch: Squeak.Epoch, millis: 0, micros: 0};
            return this.microsecondClock(this.microsecondClockLocalState);
        },
        primitiveUtcWithOffset: function(argCount) {
            var d = new Date();
            var posixMicroseconds = this.pos53BitIntFor(d.getTime() * 1000);
            var offset = -60 * d.getTimezoneOffset();
            if (argCount > 0) {
                // either an Array or a DateAndTime in new UTC format with two ivars
                var stWordIndexableObject = this.vm.stackValue(0);
                stWordIndexableObject.pointers[0] = posixMicroseconds;
                stWordIndexableObject.pointers[1] = offset;
                this.popNandPushIfOK(argCount + 1, stWordIndexableObject);
                return true;
            }
            var timeAndOffset = [
                posixMicroseconds,
                offset,
            ];
            this.popNandPushIfOK(argCount + 1, this.makeStArray(timeAndOffset));
            return true;
        },
    });

    /*
     * Copyright (c) 2014-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.subclass('Squeak.Compiler',

    /****************************************************************************

    VM and Compiler
    ===============

    The VM has an interpreter, it will work fine (and much more memory-efficient)
    without loading a compiler. The compiler plugs into the VM by providing the
    Squeak.Compiler global. It can be easily replaced by just loading a different
    script providing Squeak.Compiler.

    The VM creates the compiler instance after an image has been loaded and the VM
    been initialized. Whenever a method is activated that was not compiled yet, the
    compiler gets a chance to compile it. The compiler may decide to wait for a couple
    of activations before actually compiling it. This might prevent do-its from ever
    getting compiled, because they are only activated once. Therefore, the compiler
    is also called when a long-running non-optimized loop calls checkForInterrupts.
    Finally, whenever the interpreter is about to execute a bytecode, it calls the
    compiled method instead (which typically will execute many bytecodes):

        initialize:
            compiler = new Squeak.Compiler(vm);

        executeNewMethod, checkForInterrupts:
            if (!method.compiled && compiler)
                compiler.compile(method);

        interpret:
            if (method.compiled) method.compiled(vm);

    Note that a compiler could hook itself into a compiled method by dispatching
    to vm.compiler in the generated code. This would allow gathering statistics,
    recompiling with optimized code etc.


    About This Compiler
    ===================

    The compiler in this file is meant to be simple, fast-compiling, and general.
    It transcribes bytecodes 1-to-1 into equivalent JavaScript code using
    templates (and thus can even support single-stepping). It uses the
    interpreter's stack pointer (SP) and program counter (PC), actual context
    objects just like the interpreter, no register mapping, it does not optimize
    sends, etc.

    Jumps are handled by wrapping the whole method in a loop and switch. This also
    enables continuing in the middle of a compiled method: whenever another context
    is activated, the method returns to the main loop, and is entered again later
    with a different PC. Here is an example method, its bytecodes, and a simplified
    version of the generated JavaScript code:

        method
            [value selector] whileFalse.
            ^ 42

        0 <00> pushInstVar: 0
        1 <D0> send: #selector
        2 <A8 02> jumpIfTrue: 6
        4 <A3 FA> jumpTo: 0
        6 <21> pushConst: 42
        7 <7C> return: topOfStack

        context = vm.activeContext
        while (true) switch (vm.pc) {
        case 0:
            stack[++vm.sp] = inst[0];
            vm.pc = 2; vm.send(#selector); // activate new method
            return; // return to main loop
            // Main loop will execute the activated method. When
            // that method returns, this method will be called
            // again with vm.pc == 2 and jump directly to case 2
        case 2:
            if (stack[vm.sp--] === vm.trueObj) {
                vm.pc = 6;
                continue; // jump to case 6
            }
            // otherwise fall through to next case
        case 4:
            vm.pc = 0;
            continue; // jump to case 0
        case 6:
            stack[++vm.sp] = 42;
            vm.pc = 7; vm.doReturn(stack[vm.sp]);
            return;
        }

    Debugging support
    =================

    This compiler supports generating single-stepping code and comments, which are
    rather helpful during debugging.

    Normally, only bytecodes that can be a jump target are given a label. Also,
    bytecodes following a send operation need a label, to enable returning to that
    spot after the context switch. All other bytecodes are executed continuously.

    When compiling for single-stepping, each bytecode gets a label, and after each
    bytecode a flag is checked and the method returns if needed. Because this is
    a performance penalty, methods are first compiled without single-step support,
    and recompiled for single-stepping on demand.

    This is optional, another compiler can answer false from enableSingleStepping().
    In that case the VM will delete the compiled method and invoke the interpreter
    to single-step.

    *****************************************************************************/

    'initialization', {
        initialize: function(vm) {
            this.vm = vm;
            this.comments = !!Squeak.Compiler.comments, // generate comments
            // for debug-printing only
            this.specialSelectors = ['+', '-', '<', '>', '<=', '>=', '=', '~=', '*', '/', '\\', '@',
                'bitShift:', '//', 'bitAnd:', 'bitOr:', 'at:', 'at:put:', 'size', 'next', 'nextPut:',
                'atEnd', '==', 'class', 'blockCopy:', 'value', 'value:', 'do:', 'new', 'new:', 'x', 'y'];
            this.doitCounter = 0;
        },
    },
    'accessing', {
        compile: function(method, optClass, optSel) {
            if (method.methodSignFlag()) {
                return; // Sista bytecode set not (yet) supported by JIT
            } else if (method.compiled === undefined) {
                // 1st time
                method.compiled = false;
            } else {
                // 2nd time
                this.singleStep = false;
                this.debug = this.comments;
                var clsName = optClass && optClass.className(),
                    sel = optSel && optSel.bytesAsString();
                method.compiled = this.generate(method, clsName, sel);
            }
        },
        enableSingleStepping: function(method, optClass, optSel) {
            // recompile method for single-stepping
            if (!method.compiled || !method.compiled.canSingleStep) {
                this.singleStep = true; // generate breakpoint support
                this.debug = true;
                if (!optClass) {
                    this.vm.allMethodsDo(function(classObj, methodObj, selectorObj) {
                        if (methodObj === method) {
                            optClass = classObj;
                            optSel = selectorObj;
                            return true;
                        }
                    });
                }
                var cls = optClass && optClass.className();
                var sel = optSel && optSel.bytesAsString();
                var instVars = optClass && optClass.allInstVarNames();
                method.compiled = this.generate(method, cls, sel, instVars);
                method.compiled.canSingleStep = true;
            }
            // if a compiler does not support single-stepping, return false
            return true;
        },
        functionNameFor: function(cls, sel) {
            if (cls === undefined || cls === '?') return "DOIT_" + ++this.doitCounter;
            if (!/[^a-zA-Z0-9:_]/.test(sel))
                return (cls + "_" + sel).replace(/[: ]/g, "_");
            var op = sel.replace(/./g, function(char) {
                var repl = {'|': "OR", '~': "NOT", '<': "LT", '=': "EQ", '>': "GT",
                        '&': "AND", '@': "AT", '*': "TIMES", '+': "PLUS", '\\': "MOD",
                        '-': "MINUS", ',': "COMMA", '/': "DIV", '?': "IF"}[char];
                return repl || 'OPERATOR';
            });
            return cls.replace(/[ ]/, "_") + "__" + op + "__";
        },
    },
    'generating', {
        generate: function(method, optClass, optSel, optInstVarNames) {
            this.method = method;
            this.pc = 0;                // next bytecode
            this.endPC = 0;             // pc of furthest jump target
            this.prevPC = 0;            // pc at start of current instruction
            this.source = [];           // snippets will be joined in the end
            this.sourceLabels = {};     // source pos of generated labels
            this.needsLabel = {};       // jump targets
            this.sourcePos = {};        // source pos of optional vars / statements
            this.needsVar = {};         // true if var was used
            this.needsBreak = false;    // insert break check for previous bytecode
            if (optClass && optSel)
                this.source.push("// ", optClass, ">>", optSel, "\n");
            this.instVarNames = optInstVarNames;
            this.allVars = ['context', 'stack', 'rcvr', 'inst[', 'temp[', 'lit['];
            this.sourcePos['context']    = this.source.length; this.source.push("var context = vm.activeContext;\n");
            this.sourcePos['stack']      = this.source.length; this.source.push("var stack = context.pointers;\n");
            this.sourcePos['rcvr']       = this.source.length; this.source.push("var rcvr = vm.receiver;\n");
            this.sourcePos['inst[']      = this.source.length; this.source.push("var inst = rcvr.pointers;\n");
            this.sourcePos['temp[']      = this.source.length; this.source.push("var temp = vm.homeContext.pointers;\n");
            this.sourcePos['lit[']       = this.source.length; this.source.push("var lit = vm.method.pointers;\n");
            this.sourcePos['loop-start'] = this.source.length; this.source.push("while (true) switch (vm.pc) {\ncase 0:\n");
            this.done = false;
            while (!this.done) {
                var byte = method.bytes[this.pc++],
                    byte2 = 0;
                switch (byte & 0xF8) {
                    // load inst var
                    case 0x00: case 0x08:
                        this.generatePush("inst[", byte & 0x0F, "]");
                        break;
                    // load temp var
                    case 0x10: case 0x18:
                        this.generatePush("temp[", 6 + (byte & 0xF), "]");
                        break;
                    // loadLiteral
                    case 0x20: case 0x28: case 0x30: case 0x38:
                        this.generatePush("lit[", 1 + (byte & 0x1F), "]");
                        break;
                    // loadLiteralIndirect
                    case 0x40: case 0x48: case 0x50: case 0x58:
                        this.generatePush("lit[", 1 + (byte & 0x1F), "].pointers[1]");
                        break;
                    // storeAndPop inst var
                    case 0x60:
                        this.generatePopInto("inst[", byte & 0x07, "]");
                        break;
                    // storeAndPop temp var
                    case 0x68:
                        this.generatePopInto("temp[", 6 + (byte & 0x07), "]");
                        break;
                    // Quick push
                    case 0x70:
                        switch (byte) {
                            case 0x70: this.generatePush("rcvr"); break;
                            case 0x71: this.generatePush("vm.trueObj"); break;
                            case 0x72: this.generatePush("vm.falseObj"); break;
                            case 0x73: this.generatePush("vm.nilObj"); break;
                            case 0x74: this.generatePush("-1"); break;
                            case 0x75: this.generatePush("0"); break;
                            case 0x76: this.generatePush("1"); break;
                            case 0x77: this.generatePush("2"); break;
                        }
                        break;
                    // Quick return
                    case 0x78:
                        switch (byte) {
                            case 0x78: this.generateReturn("rcvr"); break;
                            case 0x79: this.generateReturn("vm.trueObj"); break;
                            case 0x7A: this.generateReturn("vm.falseObj"); break;
                            case 0x7B: this.generateReturn("vm.nilObj"); break;
                            case 0x7C: this.generateReturn("stack[vm.sp]"); break;
                            case 0x7D: this.generateBlockReturn(); break;
                            default: throw Error("unusedBytecode");
                        }
                        break;
                    // Extended bytecodes
                    case 0x80: case 0x88:
                        this.generateExtended(byte);
                        break;
                    // short jump
                    case 0x90:
                        this.generateJump((byte & 0x07) + 1);
                        break;
                    // short conditional jump
                    case 0x98:
                        this.generateJumpIf(false, (byte & 0x07) + 1);
                        break;
                    // long jump, forward and back
                    case 0xA0:
                        byte2 = method.bytes[this.pc++];
                        this.generateJump(((byte&7)-4) * 256 + byte2);
                        break;
                    // long conditional jump
                    case 0xA8:
                        byte2 = method.bytes[this.pc++];
                        this.generateJumpIf(byte < 0xAC, (byte & 3) * 256 + byte2);
                        break;
                    // SmallInteger ops: + - < > <= >= = ~= * /  @ lshift: lxor: land: lor:
                    case 0xB0: case 0xB8:
                        this.generateNumericOp(byte);
                        break;
                    // quick primitives: // at:, at:put:, size, next, nextPut:, ...
                    case 0xC0: case 0xC8:
                        this.generateQuickPrim(byte);
                        break;
                    // send literal selector
                    case 0xD0: case 0xD8:
                        this.generateSend("lit[", 1 + (byte & 0x0F), "]", 0, false);
                        break;
                    case 0xE0: case 0xE8:
                        this.generateSend("lit[", 1 + (byte & 0x0F), "]", 1, false);
                        break;
                    case 0xF0: case 0xF8:
                        this.generateSend("lit[", 1 + (byte & 0x0F), "]", 2, false);
                        break;
                }
            }
            var funcName = this.functionNameFor(optClass, optSel);
            if (this.singleStep) {
                if (this.debug) this.source.push("// all valid PCs have a label;\n");
                this.source.push("default: throw Error('invalid PC');\n}"); // all PCs handled
            } else {
                this.sourcePos['loop-end'] = this.source.length; this.source.push("default: vm.interpretOne(true); return;\n}");
                this.deleteUnneededLabels();
            }
            this.deleteUnneededVariables();
            return new Function("'use strict';\nreturn function " + funcName + "(vm) {\n" + this.source.join("") + "}")();
        },
        generateExtended: function(bytecode) {
            var byte2, byte3;
            switch (bytecode) {
                // extended push
                case 0x80:
                    byte2 = this.method.bytes[this.pc++];
                    switch (byte2 >> 6) {
                        case 0: this.generatePush("inst[", byte2 & 0x3F, "]"); return;
                        case 1: this.generatePush("temp[", 6 + (byte2 & 0x3F), "]"); return;
                        case 2: this.generatePush("lit[", 1 + (byte2 & 0x3F), "]"); return;
                        case 3: this.generatePush("lit[", 1 + (byte2 & 0x3F), "].pointers[1]"); return;
                    }
                // extended store
                case 0x81:
                    byte2 = this.method.bytes[this.pc++];
                    switch (byte2 >> 6) {
                        case 0: this.generateStoreInto("inst[", byte2 & 0x3F, "]"); return;
                        case 1: this.generateStoreInto("temp[", 6 + (byte2 & 0x3F), "]"); return;
                        case 2: throw Error("illegal store into literal");
                        case 3: this.generateStoreInto("lit[", 1 + (byte2 & 0x3F), "].pointers[1]"); return;
                    }
                    return;
                // extended pop into
                case 0x82:
                    byte2 = this.method.bytes[this.pc++];
                    switch (byte2 >> 6) {
                        case 0: this.generatePopInto("inst[", byte2 & 0x3F, "]"); return;
                        case 1: this.generatePopInto("temp[", 6 + (byte2 & 0x3F), "]"); return;
                        case 2: throw Error("illegal pop into literal");
                        case 3: this.generatePopInto("lit[", 1 + (byte2 & 0x3F), "].pointers[1]"); return;
                    }
                // Single extended send
                case 0x83:
                    byte2 = this.method.bytes[this.pc++];
                    this.generateSend("lit[", 1 + (byte2 & 0x1F), "]", byte2 >> 5, false);
                    return;
                // Double extended do-anything
                case 0x84:
                    byte2 = this.method.bytes[this.pc++];
                    byte3 = this.method.bytes[this.pc++];
                    switch (byte2 >> 5) {
                        case 0: this.generateSend("lit[", 1 + byte3, "]", byte2 & 31, false); return;
                        case 1: this.generateSend("lit[", 1 + byte3, "]", byte2 & 31, true); return;
                        case 2: this.generatePush("inst[", byte3, "]"); return;
                        case 3: this.generatePush("lit[", 1 + byte3, "]"); return;
                        case 4: this.generatePush("lit[", 1 + byte3, "].pointers[1]"); return;
                        case 5: this.generateStoreInto("inst[", byte3, "]"); return;
                        case 6: this.generatePopInto("inst[", byte3, "]"); return;
                        case 7: this.generateStoreInto("lit[", 1 + byte3, "].pointers[1]"); return;
                    }
                // Single extended send to super
                case 0x85:
                    byte2 = this.method.bytes[this.pc++];
                    this.generateSend("lit[", 1 + (byte2 & 0x1F), "]", byte2 >> 5, true);
                    return;
                // Second extended send
                case 0x86:
                     byte2 = this.method.bytes[this.pc++];
                     this.generateSend("lit[", 1 + (byte2 & 0x3F), "]", byte2 >> 6, false);
                     return;
                // pop
                case 0x87:
                    this.generateInstruction("pop", "vm.sp--");
                    return;
                // dup
                case 0x88:
                    this.needsVar['stack'] = true;
                    this.generateInstruction("dup", "var dup = stack[vm.sp]; stack[++vm.sp] = dup");
                    return;
                // thisContext
                case 0x89:
                    this.needsVar['stack'] = true;
                    this.generateInstruction("push thisContext", "stack[++vm.sp] = vm.exportThisContext()");
                    return;
                // closures
                case 0x8A:
                    byte2 = this.method.bytes[this.pc++];
                    var popValues = byte2 > 127,
                        count = byte2 & 127;
                    this.generateClosureTemps(count, popValues);
                    return;
                // call primitive
                case 0x8B:
                    byte2 = this.method.bytes[this.pc++];
                    byte3 = this.method.bytes[this.pc++];
                    this.generateCallPrimitive(byte2 + 256 * byte3);
                    return
                // remote push from temp vector
                case 0x8C:
                    byte2 = this.method.bytes[this.pc++];
                    byte3 = this.method.bytes[this.pc++];
                    this.generatePush("temp[", 6 + byte3, "].pointers[", byte2, "]");
                    return;
                // remote store into temp vector
                case 0x8D:
                    byte2 = this.method.bytes[this.pc++];
                    byte3 = this.method.bytes[this.pc++];
                    this.generateStoreInto("temp[", 6 + byte3, "].pointers[", byte2, "]");
                    return;
                // remote store and pop into temp vector
                case 0x8E:
                    byte2 = this.method.bytes[this.pc++];
                    byte3 = this.method.bytes[this.pc++];
                    this.generatePopInto("temp[", 6 + byte3, "].pointers[", byte2, "]");
                    return;
                // pushClosureCopy
                case 0x8F:
                    byte2 = this.method.bytes[this.pc++];
                    byte3 = this.method.bytes[this.pc++];
                    var byte4 = this.method.bytes[this.pc++];
                    var numArgs = byte2 & 0xF,
                        numCopied = byte2 >> 4,
                        blockSize = byte3 << 8 | byte4;
                    this.generateClosureCopy(numArgs, numCopied, blockSize);
                    return;
            }
        },
        generatePush: function(target, arg1, suffix1, arg2, suffix2) {
            if (this.debug) this.generateDebugCode("push", target, arg1, suffix1, arg2, suffix2);
            this.generateLabel();
            this.needsVar[target] = true;
            this.needsVar['stack'] = true;
            this.source.push("stack[++vm.sp] = ", target);
            if (arg1 !== undefined) {
                this.source.push(arg1, suffix1);
                if (arg2 !== undefined) {
                    this.source.push(arg2, suffix2);
                }
            }
            this.source.push(";\n");
        },
        generateStoreInto: function(target, arg1, suffix1, arg2, suffix2) {
            if (this.debug) this.generateDebugCode("store into", target, arg1, suffix1, arg2, suffix2);
            this.generateLabel();
            this.needsVar[target] = true;
            this.needsVar['stack'] = true;
            this.source.push(target);
            if (arg1 !== undefined) {
                this.source.push(arg1, suffix1);
                if (arg2 !== undefined) {
                    this.source.push(arg2, suffix2);
                }
            }
            this.source.push(" = stack[vm.sp];\n");
            this.generateDirty(target, arg1);
        },
        generatePopInto: function(target, arg1, suffix1, arg2, suffix2) {
            if (this.debug) this.generateDebugCode("pop into", target, arg1, suffix1, arg2, suffix2);
            this.generateLabel();
            this.needsVar[target] = true;
            this.needsVar['stack'] = true;
            this.source.push(target);
            if (arg1 !== undefined) {
                this.source.push(arg1, suffix1);
                if (arg2 !== undefined) {
                    this.source.push(arg2, suffix2);
                }
            }
            this.source.push(" = stack[vm.sp--];\n");
            this.generateDirty(target, arg1);
        },
        generateReturn: function(what) {
            if (this.debug) this.generateDebugCode("return", what);
            this.generateLabel();
            this.needsVar[what] = true;
            this.source.push(
                "vm.pc = ", this.pc, "; vm.doReturn(", what, "); return;\n");
            this.needsBreak = false; // returning anyway
            this.done = this.pc > this.endPC;
        },
        generateBlockReturn: function() {
            if (this.debug) this.generateDebugCode("block return");
            this.generateLabel();
            this.needsVar['stack'] = true;
            // actually stack === context.pointers but that would look weird
            this.source.push(
                "vm.pc = ", this.pc, "; vm.doReturn(stack[vm.sp--], context.pointers[0]); return;\n");
            this.needsBreak = false; // returning anyway
        },
        generateJump: function(distance) {
            var destination = this.pc + distance;
            if (this.debug) this.generateDebugCode("jump to " + destination);
            this.generateLabel();
            this.needsVar['context'] = true;
            this.source.push("vm.pc = ", destination, "; ");
            if (distance < 0) this.source.push(
                "\nif (vm.interruptCheckCounter-- <= 0) {\n",
                "   vm.checkForInterrupts();\n",
                "   if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return;\n",
                "}\n");
            if (this.singleStep) this.source.push("\nif (vm.breakOutOfInterpreter) return;\n");
            this.source.push("continue;\n");
            this.needsBreak = false; // already checked
            this.needsLabel[destination] = true;
            if (destination > this.endPC) this.endPC = destination;
        },
        generateJumpIf: function(condition, distance) {
            var destination = this.pc + distance;
            if (this.debug) this.generateDebugCode("jump if " + condition + " to " + destination);
            this.generateLabel();
            this.needsVar['stack'] = true;
            this.source.push(
                "var cond = stack[vm.sp--]; if (cond === vm.", condition, "Obj) {vm.pc = ", destination, "; ");
            if (this.singleStep) this.source.push("if (vm.breakOutOfInterpreter) return; else ");
            this.source.push("continue}\n",
                "else if (cond !== vm.", !condition, "Obj) {vm.sp++; vm.pc = ", this.pc, "; vm.send(vm.specialObjects[25], 0, false); return}\n");
            this.needsLabel[this.pc] = true; // for coming back after #mustBeBoolean send
            this.needsLabel[destination] = true; // obviously
            if (destination > this.endPC) this.endPC = destination;
        },
        generateQuickPrim: function(byte) {
            if (this.debug) this.generateDebugCode("quick send #" + this.specialSelectors[(byte & 0x0F) + 16]);
            this.generateLabel();
            switch (byte) {
                case 0xC0: // at:
                    this.needsVar['stack'] = true;
                    this.source.push(
                        "var a, b; if ((a=stack[vm.sp-1]).sqClass === vm.specialObjects[7] && typeof (b=stack[vm.sp]) === 'number' && b>0 && b<=a.pointers.length) {\n",
                        "  stack[--vm.sp] = a.pointers[b-1];",
                        "} else { var c = vm.primHandler.objectAt(true,true,false); if (vm.primHandler.success) stack[--vm.sp] = c; else {\n",
                        "  vm.pc = ", this.pc, "; vm.sendSpecial(16); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return; }}\n");
                    this.needsLabel[this.pc] = true;
                    return;
                case 0xC1: // at:put:
                    this.needsVar['stack'] = true;
                    this.source.push(
                        "var a, b; if ((a=stack[vm.sp-2]).sqClass === vm.specialObjects[7] && typeof (b=stack[vm.sp-1]) === 'number' && b>0 && b<=a.pointers.length) {\n",
                        "  var c = stack[vm.sp]; stack[vm.sp-=2] = a.pointers[b-1] = c; a.dirty = true;",
                        "} else { vm.primHandler.objectAtPut(true,true,false); if (vm.primHandler.success) stack[vm.sp-=2] = c; else {\n",
                        "  vm.pc = ", this.pc, "; vm.sendSpecial(17); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return; }}\n");
                    this.needsLabel[this.pc] = true;
                    return;
                case 0xC2: // size
                    this.needsVar['stack'] = true;
                    this.source.push(
                        "if (stack[vm.sp].sqClass === vm.specialObjects[7]) stack[vm.sp] = stack[vm.sp].pointersSize();\n",     // Array
                        "else if (stack[vm.sp].sqClass === vm.specialObjects[6]) stack[vm.sp] = stack[vm.sp].bytesSize();\n",   // ByteString
                        "else { vm.pc = ", this.pc, "; vm.sendSpecial(18); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return; }\n");
                    this.needsLabel[this.pc] = true;
                    return;
                //case 0xC3: return false; // next
                //case 0xC4: return false; // nextPut:
                //case 0xC5: return false; // atEnd
                case 0xC6: // ==
                    this.needsVar['stack'] = true;
                    this.source.push("var cond = stack[vm.sp-1] === stack[vm.sp];\nstack[--vm.sp] = cond ? vm.trueObj : vm.falseObj;\n");
                    return;
                case 0xC7: // class
                    this.needsVar['stack'] = true;
                    this.source.push("stack[vm.sp] = typeof stack[vm.sp] === 'number' ? vm.specialObjects[5] : stack[vm.sp].sqClass;\n");
                    return;
                case 0xC8: // blockCopy:
                    this.needsVar['rcvr'] = true;
                    this.source.push(
                        "vm.pc = ", this.pc, "; if (!vm.primHandler.quickSendOther(rcvr, ", (byte & 0x0F), ")) ",
                        "{vm.sendSpecial(", ((byte & 0x0F) + 16), "); return}\n");
                    this.needsLabel[this.pc] = true;        // for send
                    this.needsLabel[this.pc + 2] = true;    // for start of block
                    return;
                case 0xC9: // value
                case 0xCA: // value:
                case 0xCB: // do:
                    this.needsVar['rcvr'] = true;
                    this.source.push(
                        "vm.pc = ", this.pc, "; if (!vm.primHandler.quickSendOther(rcvr, ", (byte & 0x0F), ")) vm.sendSpecial(", ((byte & 0x0F) + 16), "); return;\n");
                    this.needsLabel[this.pc] = true;
                    return;
                //case 0xCC: return false; // new
                //case 0xCD: return false; // new:
                //case 0xCE: return false; // x
                //case 0xCF: return false; // y
            }
            // generic version for the bytecodes not yet handled above
            this.needsVar['rcvr'] = true;
            this.needsVar['context'] = true;
            this.source.push(
                "vm.pc = ", this.pc, "; if (!vm.primHandler.quickSendOther(rcvr, ", (byte & 0x0F), "))",
                " vm.sendSpecial(", ((byte & 0x0F) + 16), ");\n",
                "if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return;\n");
            this.needsBreak = false; // already checked
            // if falling back to a full send we need a label for coming back
            this.needsLabel[this.pc] = true;
        },
        generateNumericOp: function(byte) {
            if (this.debug) this.generateDebugCode("quick send #" + this.specialSelectors[byte & 0x0F]);
            this.generateLabel();
            // if the op cannot be executed here, do a full send and return to main loop
            // we need a label for coming back
            this.needsLabel[this.pc] = true;
            switch (byte) {
                case 0xB0: // PLUS +
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = vm.primHandler.signed32BitIntegerFor(a + b);\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(0); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB1: // MINUS -
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = vm.primHandler.signed32BitIntegerFor(a - b);\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(1); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB2: // LESS <
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = a < b ? vm.trueObj : vm.falseObj;\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(2); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB3: // GRTR >
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = a > b ? vm.trueObj : vm.falseObj;\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(3); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB4: // LEQ <=
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = a <= b ? vm.trueObj : vm.falseObj;\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(4); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB5: // GEQ >=
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = a >= b ? vm.trueObj : vm.falseObj;\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(5); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB6: // EQU =
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = a === b ? vm.trueObj : vm.falseObj;\n",
                    "} else if (a === b && a.float === a.float) {\n",   // NaN check
                    "   stack[--vm.sp] = vm.trueObj;\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(6); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB7: // NEQ ~=
                    this.needsVar['stack'] = true;
                    this.source.push("var a = stack[vm.sp - 1], b = stack[vm.sp];\n",
                    "if (typeof a === 'number' && typeof b === 'number') {\n",
                    "   stack[--vm.sp] = a !== b ? vm.trueObj : vm.falseObj;\n",
                    "} else if (a === b && a.float === a.float) {\n",   // NaN check
                    "   stack[--vm.sp] = vm.falseObj;\n",
                    "} else { vm.pc = ", this.pc, "; vm.sendSpecial(7); if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return}\n");
                    return;
                case 0xB8: // TIMES *
                    this.source.push("vm.success = true; vm.resultIsFloat = false; if(!vm.pop2AndPushNumResult(vm.stackIntOrFloat(1) * vm.stackIntOrFloat(0))) { vm.pc = ", this.pc, "; vm.sendSpecial(8); return}\n");
                    return;
                case 0xB9: // DIV /
                    this.source.push("vm.success = true; if(!vm.pop2AndPushIntResult(vm.quickDivide(vm.stackInteger(1),vm.stackInteger(0)))) { vm.pc = ", this.pc, "; vm.sendSpecial(9); return}\n");
                    return;
                case 0xBA: // MOD \
                    this.source.push("vm.success = true; if(!vm.pop2AndPushIntResult(vm.mod(vm.stackInteger(1),vm.stackInteger(0)))) { vm.pc = ", this.pc, "; vm.sendSpecial(10); return}\n");
                    return;
                case 0xBB:  // MakePt int@int
                    this.source.push("vm.success = true; if(!vm.primHandler.primitiveMakePoint(1, true)) { vm.pc = ", this.pc, "; vm.sendSpecial(11); return}\n");
                    return;
                case 0xBC: // bitShift:
                    this.source.push("vm.success = true; if(!vm.pop2AndPushIntResult(vm.safeShift(vm.stackInteger(1),vm.stackInteger(0)))) { vm.pc = ", this.pc, "; vm.sendSpecial(12); return}\n");
                    return;
                case 0xBD: // Divide //
                    this.source.push("vm.success = true; if(!vm.pop2AndPushIntResult(vm.div(vm.stackInteger(1),vm.stackInteger(0)))) { vm.pc = ", this.pc, "; vm.sendSpecial(13); return}\n");
                    return;
                case 0xBE: // bitAnd:
                    this.source.push("vm.success = true; if(!vm.pop2AndPushIntResult(vm.stackInteger(1) & vm.stackInteger(0))) { vm.pc = ", this.pc, "; vm.sendSpecial(14); return}\n");
                    return;
                case 0xBF: // bitOr:
                    this.source.push("vm.success = true; if(!vm.pop2AndPushIntResult(vm.stackInteger(1) | vm.stackInteger(0))) { vm.pc = ", this.pc, "; vm.sendSpecial(15); return}\n");
                    return;
            }
        },
        generateSend: function(prefix, num, suffix, numArgs, superSend) {
            if (this.debug) this.generateDebugCode("send " + (prefix === "lit[" ? this.method.pointers[num].bytesAsString() : "..."));
            this.generateLabel();
            this.needsVar[prefix] = true;
            this.needsVar['context'] = true;
            // set pc, activate new method, and return to main loop
            // unless the method was a successfull primitive call (no context change)
            this.source.push(
                "vm.pc = ", this.pc, "; vm.send(", prefix, num, suffix, ", ", numArgs, ", ", superSend, "); ",
                "if (context !== vm.activeContext || vm.breakOutOfInterpreter !== false) return;\n");
            this.needsBreak = false; // already checked
            // need a label for coming back after send
            this.needsLabel[this.pc] = true;
        },
        generateClosureTemps: function(count, popValues) {
            if (this.debug) this.generateDebugCode("closure temps");
            this.generateLabel();
            this.needsVar['stack'] = true;
            this.source.push("var array = vm.instantiateClass(vm.specialObjects[7], ", count, ");\n");
            if (popValues) {
                for (var i = 0; i < count; i++)
                    this.source.push("array.pointers[", i, "] = stack[vm.sp - ", count - i - 1, "];\n");
                this.source.push("stack[vm.sp -= ", count - 1, "] = array;\n");
            } else {
                this.source.push("stack[++vm.sp] = array;\n");
            }
        },
        generateClosureCopy: function(numArgs, numCopied, blockSize) {
            var from = this.pc,
                to = from + blockSize;
            if (this.debug) this.generateDebugCode("push closure(" + from + "-" + (to-1) + "): " + numCopied + " copied, " + numArgs + " args");
            this.generateLabel();
            this.needsVar['stack'] = true;
            this.source.push(
                "var closure = vm.instantiateClass(vm.specialObjects[36], ", numCopied, ");\n",
                "closure.pointers[0] = context; vm.reclaimableContextCount = 0;\n",
                "closure.pointers[1] = ", from + this.method.pointers.length * 4 + 1, ";\n",  // encodeSqueakPC
                "closure.pointers[2] = ", numArgs, ";\n");
            if (numCopied > 0) {
                for (var i = 0; i < numCopied; i++)
                    this.source.push("closure.pointers[", i + 3, "] = stack[vm.sp - ", numCopied - i - 1,"];\n");
                this.source.push("stack[vm.sp -= ", numCopied - 1,"] = closure;\n");
            } else {
                this.source.push("stack[++vm.sp] = closure;\n");
            }
            this.source.push("vm.pc = ", to, ";\n");
            if (this.singleStep) this.source.push("if (vm.breakOutOfInterpreter) return;\n");
            this.source.push("continue;\n");
            this.needsBreak = false; // already checked
            this.needsLabel[from] = true;   // initial pc when activated
            this.needsLabel[to] = true;     // for jump over closure
            if (to > this.endPC) this.endPC = to;
        },
        generateCallPrimitive: function(index) {
            if (this.debug) this.generateDebugCode("call primitive " + index);
            this.generateLabel();
            if (this.method.bytes[this.pc] === 0x81)  {// extended store
                this.needsVar['stack'] = true;
                this.source.push("if (vm.primFailCode) {stack[vm.sp] = vm.getErrorObjectFromPrimFailCode(); vm.primFailCode = 0;}\n");
            }
        },
        generateDirty: function(target, arg) {
            switch(target) {
                case "inst[": this.source.push("rcvr.dirty = true;\n"); break;
                case "lit[": this.source.push(target, arg, "].dirty = true;\n"); break;
                case "temp[": break;
                default:
                    throw Error("unexpected target " + target);
            }
        },
        generateLabel: function() {
            // remember label position for deleteUnneededLabels()
            if (this.prevPC) {
                this.sourceLabels[this.prevPC] = this.source.length;
                this.source.push("case ", this.prevPC, ":\n");           // must match deleteUnneededLabels
            }
            this.prevPC = this.pc;
        },
        generateDebugCode: function(command, what, arg1, suffix1, arg2, suffix2) {
            // single-step for previous instructiuon
            if (this.needsBreak) {
                 this.source.push("if (vm.breakOutOfInterpreter) {vm.pc = ", this.prevPC, "; return}\n");
                 this.needsLabel[this.prevPC] = true;
            }
            // comment for this instruction
            var bytecodes = [];
            for (var i = this.prevPC; i < this.pc; i++)
                bytecodes.push((this.method.bytes[i] + 0x100).toString(16).slice(-2).toUpperCase());
            this.source.push("// ", this.prevPC, " <", bytecodes.join(" "), "> ", command);
            // append argument to comment
            if (what) {
                this.source.push(" ");
                switch (what) {
                    case 'vm.nilObj':    this.source.push('nil'); break;
                    case 'vm.trueObj':   this.source.push('true'); break;
                    case 'vm.falseObj':  this.source.push('false'); break;
                    case 'rcvr':         this.source.push('self'); break;
                    case 'stack[vm.sp]': this.source.push('top of stack'); break;
                    case 'inst[':
                        if (!this.instVarNames) this.source.push('inst var ', arg1);
                        else this.source.push(this.instVarNames[arg1]);
                        break;
                    case 'temp[':
                        this.source.push('tmp', arg1 - 6);
                        if (suffix1 !== ']') this.source.push('[', arg2, ']');
                        break;
                    case 'lit[':
                        var lit = this.method.pointers[arg1];
                        if (suffix1 === ']') this.source.push(lit);
                        else this.source.push(lit.pointers[0].bytesAsString());
                        break;
                    default:
                        this.source.push(what);
                }
            }
            this.source.push("\n");
            // enable single-step for next instruction
            this.needsBreak = this.singleStep;
        },
        generateInstruction: function(comment, instr) {
            if (this.debug) this.generateDebugCode(comment);
            this.generateLabel();
            this.source.push(instr, ";\n");
        },
        deleteUnneededLabels: function() {
            // switch statement is more efficient with fewer labels
            var hasAnyLabel = false;
            for (var i in this.sourceLabels)
                if (this.needsLabel[i])
                    hasAnyLabel = true;
                else for (var j = 0; j < 3; j++)
                   this.source[this.sourceLabels[i] + j] = "";
            if (!hasAnyLabel) {
                this.source[this.sourcePos['loop-start']] = "";
                this.source[this.sourcePos['loop-end']] = "";
            }
        },
        deleteUnneededVariables: function() {
            if (this.needsVar['stack']) this.needsVar['context'] = true;
            if (this.needsVar['inst[']) this.needsVar['rcvr'] = true;
            for (var i = 0; i < this.allVars.length; i++) {
                var v = this.allVars[i];
                if (!this.needsVar[v])
                    this.source[this.sourcePos[v]] = "";
            }
        },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.extend(Squeak,
    "known classes", {
        // BitBlt layout:
        BitBlt_dest: 0,
        BitBlt_source: 1,
        BitBlt_halftone: 2,
        BitBlt_combinationRule: 3,
        BitBlt_destX: 4,
        BitBlt_destY: 5,
        BitBlt_width: 6,
        BitBlt_height: 7,
        BitBlt_sourceX: 8,
        BitBlt_sourceY: 9,
        BitBlt_clipX: 10,
        BitBlt_clipY: 11,
        BitBlt_clipW: 12,
        BitBlt_clipH: 13,
        BitBlt_colorMap: 14,
        BitBlt_warpBase: 15,
        // Form layout:
        Form_bits: 0,
        Form_width: 1,
        Form_height: 2,
        Form_depth: 3,
        Form_offset: 4,
    });

    Object.extend(Squeak.Primitives.prototype,
    'display', {
        displayDirty: function() {},
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    // Fake display primitives for headless usage in node
    // Most primitives simply fail, some require answering a value to keep images working
    Object.extend(Squeak.Primitives.prototype,
    'display', {
    	primitiveScreenSize: function() { return false; },
    	primitiveScreenDepth: function() { return false; },
    	primitiveTestDisplayDepth: function() { return false; },
    	primitiveBeDisplay: function(argCount) {
    		this.vm.popN(argCount);	// Answer self
    		return true;
    	},
    	primitiveReverseDisplay: function() { return false; },
    	primitiveDeferDisplayUpdates: function() { return false; },
    	primitiveForceDisplayUpdate: function() { return false; },
    	primitiveScanCharacters: function() { return false; },
    	primitiveSetFullScreen: function() { return false; },
    	primitiveShowDisplayRect: function() { return false; },
    	primitiveBeCursor: function(argCount) {
    		this.vm.popN(argCount);	// Answer self
    		return true;
    	},
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.extend(Squeak,
    "events", {
        Mouse_Blue: 1,
        Mouse_Yellow: 2,
        Mouse_Red: 4,
        Keyboard_Shift: 8,
        Keyboard_Ctrl: 16,
        Keyboard_Alt: 32,
        Keyboard_Cmd: 64,
        Mouse_All: 1 + 2 + 4,
        Keyboard_All: 8 + 16 + 32 + 64,
        EventTypeNone: 0,
        EventTypeMouse: 1,
        EventTypeKeyboard: 2,
        EventTypeDragDropFiles: 3,
        EventKeyChar: 0,
        EventKeyDown: 1,
        EventKeyUp: 2,
        EventDragEnter: 1,
        EventDragMove: 2,
        EventDragLeave: 3,
        EventDragDrop: 4,
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    // Fake input primitives for headless usage
    // Most primitives simply fail, some require answering a value to keep images working
    Object.extend(Squeak.Primitives.prototype,
    'input', {
    	primitiveMouseButtons: function() { return false; },
    	primitiveMousePoint: function() { return false; },
    	primitiveKeyboardNext: function() { return false; },
    	primitiveKeyboardPeek: function() { return false; },
    	primitiveInputSemaphore: function(argCount) {
    		this.vm.popNandPush(argCount + 1, this.vm.nilObj);
    		return true;
    	},
    	primitiveInputWord: function() { return false; },
    	primitiveGetNextEvent: function() { return false; },
    	primitiveBeep: function() { return false; },
    	primitiveClipboardText: function() { return false; },
    });

    /*
     * Copyright (c) 2013-2020 Vanessa Freudenberg
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    Object.extend(Squeak.Primitives.prototype,
    'initialization', {
        initPlugins: function() {
            Object.extend(this.builtinModules, {
                JavaScriptPlugin:       this.findPluginFunctions("js_"),
                FilePlugin:             this.findPluginFunctions("", "primitive(Disable)?(File|Directory)"),
                DropPlugin:             this.findPluginFunctions("", "primitiveDropRequest"),
                SoundPlugin:            this.findPluginFunctions("snd_"),
                JPEGReadWriter2Plugin:  this.findPluginFunctions("jpeg2_"),
                SqueakFFIPrims:         this.findPluginFunctions("ffi_", "", true),
                SecurityPlugin: {
                    primitiveDisableImageWrite: this.fakePrimitive.bind(this, "SecurityPlugin.primitiveDisableImageWrite", 0),
                },
                LocalePlugin: {
                    primitiveTimezoneOffset: this.fakePrimitive.bind(this, "LocalePlugin.primitiveTimezoneOffset", 0),
                },
            });
            Object.extend(this.patchModules, {
                ScratchPlugin:          this.findPluginFunctions("scratch_"),
            });
        },
        findPluginFunctions: function(prefix, match, bindLate) {
            match = match || "(initialise|shutdown|prim)";
            var plugin = {},
                regex = new RegExp("^" + prefix + match, "i");
            for (var funcName in this)
                if (regex.test(funcName) && typeof this[funcName] == "function") {
                    var primName = funcName;
                    if (prefix) primName = funcName[prefix.length].toLowerCase() + funcName.slice(prefix.length + 1);
                    plugin[primName] = bindLate ? funcName : this[funcName].bind(this);
                }
            return plugin;
        },
    });

    /*
     * This plugin simply adds "console.log" functionality.
     * 
     * Add the following method to the Smalltalk image (to Object for example) to use it:
     * primLog: messageString level: levelString
     *
     *	"Log messageString to the console. The specified level should be one of:
     *		'log'
     *		'info'
     *		'warn'
     *		'error'
     *	"
     *
     * 	<primitive: 'primitiveLog:level:' module: 'ConsolePlugin'>
     *	^ self
     */

    function ConsolePlugin() {

      return {
        getModuleName: function() { return "ConsolePlugin"; },
        interpreterProxy: null,

        setInterpreter: function(anInterpreter) {
          this.interpreterProxy = anInterpreter;
          return true;
        },

        // Logging
        "primitiveLog:level:": function(argCount) {
          if (argCount !== 2) return false;
          var message = this.interpreterProxy.stackValue(1).bytesAsString();
          var level = this.interpreterProxy.stackValue(0).bytesAsString();
          console[level](message);
          this.interpreterProxy.pop(argCount);	// Answer self
          return true;
        }
      };
    }

    function registerConsolePlugin() {
        if (typeof Squeak === "object" && Squeak.registerExternalModule) {
            Squeak.registerExternalModule("ConsolePlugin", ConsolePlugin());
        } else self.setTimeout(registerConsolePlugin, 100);
    }
    registerConsolePlugin();

    // This is a minimal headless SqueakJS VM

    // Run image by starting interpreter on it
    function runImage(imageData, imageName, options) {

        // Create Squeak image from raw data
        var image = new Squeak.Image(imageName.replace(/\.image$/i, ""));
        image.readFromBuffer(imageData, function startRunning() {

            // Create fake display and create interpreter
            var display = { vmOptions: [ "-vm-display-null", "-nodisplay" ] };
            var vm = new Squeak.Interpreter(image, display);
            function run() {
                try {
                    vm.interpret(50, function runAgain(ms) {
                        // Ignore display.quitFlag when requested.
                        // Some Smalltalk images quit when no display is found.
                        if(options.ignoreQuit || !display.quitFlag) {
                            setTimeout(run, ms === "sleep" ? 10 : ms);
                        }
                    });
                } catch(e) {
                    console.error("Failure during Squeak run: ", e);
                }
            }

            // Start the interpreter
            run();
        });
    }

    function fetchImageAndRun(imageName, options) {
        fetch(imageName, {
            method: "GET",
            mode: "cors",
            cache: "no-store"
        }).then(function(response) {
            if(!response.ok) {
                throw new Error("Response not OK: " + response.status);
            }
            return response.arrayBuffer();
        }).then(function(imageData) {
            runImage(imageData, imageName, options);
        }).catch(function(error) {
            console.error("Failed to retrieve image", error);
        });
    }

    // Extend Squeak with settings and options to fetch and run image
    Object.extend(Squeak, {
        vmPath: "/",
        platformSubtype: "Browser",
        osVersion: navigator.userAgent,     // might want to parse
        windowSystem: "headless",
        fetchImageAndRun: fetchImageAndRun,
    });


    // Retrieve image name from URL
    var searchParams = (new URL(self.location)).searchParams;
    var imageName = searchParams.get("imageName");
    if(imageName) {
        var options = {
            ignoreQuit: searchParams.get("ignoreQuit") !== null
        };
        fetchImageAndRun(imageName, options);
    }

    /* Smalltalk from Squeak4.5 with VMMaker 4.13.6 translated as JS source on 3 November 2014 1:52:21 pm */
    /* Automatically generated by
    	JSSmartSyntaxPluginCodeGenerator VMMakerJS-bf.15 uuid: fd4e10f2-3773-4e80-8bb5-c4b471a014e5
       from
    	LargeIntegersPlugin VMMaker-bf.353 uuid: 8ae25e7e-8d2c-451e-8277-598b30e9c002
     */

    (function LargeIntegers() {

    var VM_PROXY_MAJOR = 1;
    var VM_PROXY_MINOR = 11;

    /*** Functions ***/
    function CLASSOF(obj) { return typeof obj === "number" ? interpreterProxy.classSmallInteger() : obj.sqClass }
    function BYTESIZEOF(obj) { return obj.bytes ? obj.bytes.length : obj.words ? obj.words.length * 4 : 0 }
    function DIV(a, b) { return Math.floor(a / b) | 0; }   // integer division
    function MOD(a, b) { return a - DIV(a, b) * b | 0; }   // signed modulus
    function SHL(a, b) { return b > 31 ? 0 : a << b; }     // fix JS shift
    function SHR(a, b) { return b > 31 ? 0 : a >>> b; }    // fix JS shift

    /*** Variables ***/
    var andOpIndex = 0;
    var interpreterProxy = null;
    var moduleName = "LargeIntegers v1.5 (e)";
    var orOpIndex = 1;
    var xorOpIndex = 2;



    /*	Argument has to be aBytesOop! */
    /*	Tests for any magnitude bits in the interval from start to stopArg. */

    function anyBitOfBytesfromto(aBytesOop, start, stopArg) {
    	var lastByteIx;
    	var digit;
    	var magnitude;
    	var leftShift;
    	var rightShift;
    	var firstByteIx;
    	var stop;
    	var mask;
    	var ix;

    	// missing DebugCode;
    	if ((start < 1) || (stopArg < 1)) {
    		return interpreterProxy.primitiveFail();
    	}
    	magnitude = aBytesOop;
    	stop = Math.min(stopArg, highBitOfBytes(magnitude));
    	if (start > stop) {
    		return false;
    	}
    	firstByteIx = ((start - 1) >> 3) + 1;
    	lastByteIx = ((stop - 1) >> 3) + 1;
    	rightShift = MOD((start - 1), 8);
    	leftShift = 7 - (MOD((stop - 1), 8));
    	if (firstByteIx === lastByteIx) {
    		mask = (SHL(255, rightShift)) & (SHR(255, leftShift));
    		digit = digitOfBytesat(magnitude, firstByteIx);
    		return (digit & mask) !== 0;
    	}
    	if ((SHR(digitOfBytesat(magnitude, firstByteIx), rightShift)) !== 0) {
    		return true;
    	}
    	for (ix = (firstByteIx + 1); ix <= (lastByteIx - 1); ix++) {
    		if (digitOfBytesat(magnitude, ix) !== 0) {
    			return true;
    		}
    	}
    	if (((SHL(digitOfBytesat(magnitude, lastByteIx), leftShift)) & 255) !== 0) {
    		return true;
    	}
    	return false;
    }


    /*	Attention: this method invalidates all oop's! Only newBytes is valid at return. */
    /*	Does not normalize. */

    function bytesgrowTo(aBytesObject, newLen) {
    	var oldLen;
    	var copyLen;
    	var newBytes;

    	newBytes = interpreterProxy.instantiateClassindexableSize(CLASSOF(aBytesObject), newLen);
    	oldLen = BYTESIZEOF(aBytesObject);
    	if (oldLen < newLen) {
    		copyLen = oldLen;
    	} else {
    		copyLen = newLen;
    	}
    	cDigitCopyFromtolen(aBytesObject.bytes, newBytes.bytes, copyLen);
    	return newBytes;
    }


    /*	Attention: this method invalidates all oop's! Only newBytes is valid at return. */

    function bytesOrIntgrowTo(oop, len) {
    	var sq_class;
    	var val;
    	var newBytes;

    	if (typeof oop === "number") {
    		val = oop;
    		if (val < 0) {
    			sq_class = interpreterProxy.classLargeNegativeInteger();
    		} else {
    			sq_class = interpreterProxy.classLargePositiveInteger();
    		}
    		newBytes = interpreterProxy.instantiateClassindexableSize(sq_class, len);
    		cCopyIntValtoBytes(val, newBytes);
    	} else {
    		newBytes = bytesgrowTo(oop, len);
    	}
    	return newBytes;
    }

    function cCopyIntValtoBytes(val, bytes) {
    	var pByte;
    	var ix;
    	var ixLimiT;

    	pByte = bytes.bytes;
    	for (ix = 1, ixLimiT = cDigitLengthOfCSI(val); ix <= ixLimiT; ix++) {
    		pByte[ix - 1] = cDigitOfCSIat(val, ix);
    	}
    }


    /*	pByteRes len = longLen; returns over.. */

    function cDigitAddlenwithleninto(pByteShort, shortLen, pByteLong, longLen, pByteRes) {
    	var i;
    	var limit;
    	var accum;

    	accum = 0;
    	limit = shortLen - 1;
    	for (i = 0; i <= limit; i++) {
    		accum = ((accum >>> 8) + pByteShort[i]) + pByteLong[i];
    		pByteRes[i] = (accum & 255);
    	}
    	limit = longLen - 1;
    	for (i = shortLen; i <= limit; i++) {
    		accum = (accum >>> 8) + pByteLong[i];
    		pByteRes[i] = (accum & 255);
    	}
    	return accum >>> 8;
    }


    /*	Precondition: pFirst len = pSecond len. */

    function cDigitComparewithlen(pFirst, pSecond, len) {
    	var firstDigit;
    	var secondDigit;
    	var ix;

    	ix = len - 1;
    	while (ix >= 0) {
    		if (((secondDigit = pSecond[ix])) !== ((firstDigit = pFirst[ix]))) {
    			if (secondDigit < firstDigit) {
    				return 1;
    			} else {
    				return -1;
    			}
    		}
    		--ix;
    	}
    	return 0;
    }

    function cDigitCopyFromtolen(pFrom, pTo, len) {
    	var limit;
    	var i;
    	limit = len - 1;
    	for (i = 0; i <= limit; i++) {
    		pTo[i] = pFrom[i];
    	}
    	return 0;
    }

    function cDigitDivlenremlenquolen(pDiv, divLen, pRem, remLen, pQuo, quoLen) {
    	var b;
    	var q;
    	var a;
    	var dnh;
    	var lo;
    	var hi;
    	var r3;
    	var mul;
    	var cond;
    	var l;
    	var k;
    	var j;
    	var i;
    	var dl;
    	var ql;
    	var r1r2;
    	var dh;
    	var t;


    	/* Last actual byte of data (ST ix) */

    	dl = divLen - 1;
    	ql = quoLen;
    	dh = pDiv[dl - 1];
    	if (dl === 1) {
    		dnh = 0;
    	} else {
    		dnh = pDiv[dl - 2];
    	}
    	for (k = 1; k <= ql; k++) {

    		/* maintain quo*arg+rem=self */
    		/* Estimate rem/div by dividing the leading two digits of rem by dh. */
    		/* The estimate is q = qhi*16r100+qlo, where qhi and qlo are unsigned char. */


    		/* r1 := rem digitAt: j. */

    		j = (remLen + 1) - k;
    		if (pRem[j - 1] === dh) {
    			q = 255;
    		} else {

    			/* Compute q = (r1,r2)//dh, t = (r1,r2)\\dh. */
    			/* r2 := (rem digitAt: j - 2). */

    			r1r2 = pRem[j - 1];
    			r1r2 = (r1r2 << 8) + pRem[j - 2];
    			t = MOD(r1r2, dh);

    			/* Next compute (hi,lo) := q*dnh */

    			q = DIV(r1r2, dh);
    			mul = q * dnh;
    			hi = mul >>> 8;

    			/* Correct overestimate of q.                
    				Max of 2 iterations through loop -- see Knuth vol. 2 */

    			lo = mul & 255;
    			if (j < 3) {
    				r3 = 0;
    			} else {
    				r3 = pRem[j - 3];
    			}
    					while (true) {
    				if ((t < hi) || ((t === hi) && (r3 < lo))) {

    					/* i.e. (t,r3) < (hi,lo) */

    					--q;
    					if (lo < dnh) {
    						--hi;
    						lo = (lo + 256) - dnh;
    					} else {
    						lo -= dnh;
    					}
    					cond = hi >= dh;
    				} else {
    					cond = false;
    				}
    				if (!(cond)) break;
    				hi -= dh;
    			}
    		}
    		l = j - dl;
    		a = 0;
    		for (i = 1; i <= divLen; i++) {
    			hi = pDiv[i - 1] * (q >>> 8);
    			lo = pDiv[i - 1] * (q & 255);
    			b = (pRem[l - 1] - a) - (lo & 255);
    			pRem[l - 1] = (b & 255);

    			/* This is a possible replacement to simulate arithmetic shift (preserving sign of b) */
    			/* b := b >> 8 bitOr: (0 - (b >> ((interpreterProxy sizeof: b)*8 */
    			/* CHAR_BIT */
    			/* -1)) << 8). */

    			b = b >> 8;
    			a = (hi + (lo >>> 8)) - b;
    			++l;
    		}
    		if (a > 0) {

    			/* Add div back into rem, decrease q by 1 */

    			--q;
    			l = j - dl;
    			a = 0;
    			for (i = 1; i <= divLen; i++) {
    				a = ((a >>> 8) + pRem[l - 1]) + pDiv[i - 1];
    				pRem[l - 1] = (a & 255);
    				++l;
    			}
    		}
    		pQuo[quoLen - k] = q;
    	}
    	return 0;
    }


    /*	Answer the index (in bits) of the high order bit of the receiver, or zero if the    
    	 receiver is zero. This method is allowed (and needed) for     
    	LargeNegativeIntegers as well, since Squeak's LargeIntegers are     
    	sign/magnitude. */

    function cDigitHighBitlen(pByte, len) {
    	var lastDigit;
    	var realLength;

    	realLength = len;
    	while (((lastDigit = pByte[realLength - 1])) === 0) {
    		if (((--realLength)) === 0) {
    			return 0;
    		}
    	}
    	return cHighBit(lastDigit) + (8 * (realLength - 1));
    }


    /*	Answer the number of indexable fields of a CSmallInteger. This value is 
    	   the same as the largest legal subscript. */

    function cDigitLengthOfCSI(csi) {
    	if ((csi < 256) && (csi > -256)) {
    		return 1;
    	}
    	if ((csi < 65536) && (csi > -65536)) {
    		return 2;
    	}
    	if ((csi < 16777216) && (csi > -16777216)) {
    		return 3;
    	}
    	return 4;
    }


    /*	C indexed! */

    function cDigitLshiftfromlentolen(shiftCount, pFrom, lenFrom, pTo, lenTo) {
    	var digitShift;
    	var carry;
    	var digit;
    	var i;
    	var bitShift;
    	var rshift;
    	var limit;

    	digitShift = shiftCount >> 3;
    	bitShift = MOD(shiftCount, 8);
    	limit = digitShift - 1;
    	for (i = 0; i <= limit; i++) {
    		pTo[i] = 0;
    	}
    	if (bitShift === 0) {

    		/* Fast version for digit-aligned shifts */
    		/* C indexed! */

    		return cDigitReplacefromtowithstartingAt(pTo, digitShift, lenTo - 1, pFrom, 0);
    	}
    	rshift = 8 - bitShift;
    	carry = 0;
    	limit = lenFrom - 1;
    	for (i = 0; i <= limit; i++) {
    		digit = pFrom[i];
    		pTo[i + digitShift] = ((carry | (SHL(digit, bitShift))) & 255);
    		carry = SHR(digit, rshift);
    	}
    	if (carry !== 0) {
    		pTo[lenTo - 1] = carry;
    	}
    	return 0;
    }

    function cDigitMontgomerylentimeslenmodulolenmInvModBinto(pBytesFirst, firstLen, pBytesSecond, secondLen, pBytesThird, thirdLen, mInv, pBytesRes) {
    	var k;
    	var i;
    	var lastByte;
    	var limit3;
    	var limit2;
    	var limit1;
    	var u;
    	var accum;

    	limit1 = firstLen - 1;
    	limit2 = secondLen - 1;
    	limit3 = thirdLen - 1;
    	lastByte = 0;
    	for (i = 0; i <= limit1; i++) {
    		accum = pBytesRes[0] + (pBytesFirst[i] * pBytesSecond[0]);
    		u = (accum * mInv) & 255;
    		accum += u * pBytesThird[0];
    		for (k = 1; k <= limit2; k++) {
    			accum = (((accum >>> 8) + pBytesRes[k]) + (pBytesFirst[i] * pBytesSecond[k])) + (u * pBytesThird[k]);
    			pBytesRes[k - 1] = (accum & 255);
    		}
    		for (k = secondLen; k <= limit3; k++) {
    			accum = ((accum >>> 8) + pBytesRes[k]) + (u * pBytesThird[k]);
    			pBytesRes[k - 1] = (accum & 255);
    		}
    		accum = (accum >>> 8) + lastByte;
    		pBytesRes[limit3] = (accum & 255);
    		lastByte = accum >>> 8;
    	}
    	for (i = firstLen; i <= limit3; i++) {
    		accum = pBytesRes[0];
    		u = (accum * mInv) & 255;
    		accum += u * pBytesThird[0];
    		for (k = 1; k <= limit3; k++) {
    			accum = ((accum >>> 8) + pBytesRes[k]) + (u * pBytesThird[k]);
    			pBytesRes[k - 1] = (accum & 255);
    		}
    		accum = (accum >>> 8) + lastByte;
    		pBytesRes[limit3] = (accum & 255);
    		lastByte = accum >>> 8;
    	}
    	if (!((lastByte === 0) && (cDigitComparewithlen(pBytesThird, pBytesRes, thirdLen) === 1))) {

    		/* self cDigitSub: pBytesThird len: thirdLen with: pBytesRes len: thirdLen into: pBytesRes */

    		accum = 0;
    		for (i = 0; i <= limit3; i++) {
    			accum = (accum + pBytesRes[i]) - pBytesThird[i];
    			pBytesRes[i] = (accum & 255);
    			accum = accum >> 8;
    		}
    	}
    }

    function cDigitMultiplylenwithleninto(pByteShort, shortLen, pByteLong, longLen, pByteRes) {
    	var ab;
    	var j;
    	var digit;
    	var carry;
    	var i;
    	var limitLong;
    	var k;
    	var limitShort;

    	if ((shortLen === 1) && (pByteShort[0] === 0)) {
    		return 0;
    	}
    	if ((longLen === 1) && (pByteLong[0] === 0)) {
    		return 0;
    	}
    	limitShort = shortLen - 1;
    	limitLong = longLen - 1;
    	for (i = 0; i <= limitShort; i++) {
    		if (((digit = pByteShort[i])) !== 0) {
    			k = i;

    			/* Loop invariant: 0<=carry<=0377, k=i+j-1 (ST) */
    			/* -> Loop invariant: 0<=carry<=0377, k=i+j (C) (?) */

    			carry = 0;
    			for (j = 0; j <= limitLong; j++) {
    				ab = pByteLong[j];
    				ab = ((ab * digit) + carry) + pByteRes[k];
    				carry = ab >>> 8;
    				pByteRes[k] = (ab & 255);
    				++k;
    			}
    			pByteRes[k] = carry;
    		}
    	}
    	return 0;
    }


    /*	Answer the value of an indexable field in the receiver.              
    	LargePositiveInteger uses bytes of base two number, and each is a       
    	      'digit' base 256. */
    /*	ST indexed! */

    function cDigitOfCSIat(csi, ix) {
    	if (ix < 1) {
    		interpreterProxy.primitiveFail();
    	}
    	if (ix > 4) {
    		return 0;
    	}
    	if (csi < 0) {
    		return (SHR((0 - csi), ((ix - 1) * 8))) & 255;
    	} else {
    		return (SHR(csi, ((ix - 1) * 8))) & 255;
    	}
    }


    /*	pByteRes len = longLen. */

    function cDigitOpshortlenlongleninto(opIndex, pByteShort, shortLen, pByteLong, longLen, pByteRes) {
    	var i;
    	var limit;

    	limit = shortLen - 1;
    	if (opIndex === andOpIndex) {
    		for (i = 0; i <= limit; i++) {
    			pByteRes[i] = (pByteShort[i] & pByteLong[i]);
    		}
    		limit = longLen - 1;
    		for (i = shortLen; i <= limit; i++) {
    			pByteRes[i] = 0;
    		}
    		return 0;
    	}
    	if (opIndex === orOpIndex) {
    		for (i = 0; i <= limit; i++) {
    			pByteRes[i] = (pByteShort[i] | pByteLong[i]);
    		}
    		limit = longLen - 1;
    		for (i = shortLen; i <= limit; i++) {
    			pByteRes[i] = pByteLong[i];
    		}
    		return 0;
    	}
    	if (opIndex === xorOpIndex) {
    		for (i = 0; i <= limit; i++) {
    			pByteRes[i] = (pByteShort[i] ^ pByteLong[i]);
    		}
    		limit = longLen - 1;
    		for (i = shortLen; i <= limit; i++) {
    			pByteRes[i] = pByteLong[i];
    		}
    		return 0;
    	}
    	return interpreterProxy.primitiveFail();
    }


    /*	C indexed! */

    function cDigitReplacefromtowithstartingAt(pTo, start, stop, pFrom, repStart) {
    	return function() {
    		// inlining self cDigitCopyFrom: pFrom + repStart to: pTo + start len: stop - start + 1
    		var len = stop - start + 1;
    		for (var i = 0; i < len; i++) {
    			pTo[i + start] = pFrom[i + repStart];
    		}
    		return 0;
    	}();
    }

    function cDigitRshiftfromlentolen(shiftCount, pFrom, fromLen, pTo, toLen) {
    	var j;
    	var digitShift;
    	var carry;
    	var digit;
    	var bitShift;
    	var leftShift;
    	var limit;
    	var start;

    	digitShift = shiftCount >> 3;
    	bitShift = MOD(shiftCount, 8);
    	if (bitShift === 0) {

    		/* Fast version for byte-aligned shifts */
    		/* C indexed! */

    		return cDigitReplacefromtowithstartingAt(pTo, 0, toLen - 1, pFrom, digitShift);
    	}
    	leftShift = 8 - bitShift;
    	carry = SHR(pFrom[digitShift], bitShift);
    	start = digitShift + 1;
    	limit = fromLen - 1;
    	for (j = start; j <= limit; j++) {
    		digit = pFrom[j];
    		pTo[j - start] = ((carry | (SHL(digit, leftShift))) & 255);
    		carry = SHR(digit, bitShift);
    	}
    	if (carry !== 0) {
    		pTo[toLen - 1] = carry;
    	}
    	return 0;
    }

    function cDigitSublenwithleninto(pByteSmall, smallLen, pByteLarge, largeLen, pByteRes) {
    	var i;
    	var z;


    	/* Loop invariant is -1<=z<=0 */

    	z = 0;
    	for (i = 0; i <= (smallLen - 1); i++) {
    		z = (z + pByteLarge[i]) - pByteSmall[i];
    		pByteRes[i] = (z & 255);
    		z = z >> 8;
    	}
    	for (i = smallLen; i <= (largeLen - 1); i++) {
    		z += pByteLarge[i];
    		pByteRes[i] = (z & 255);
    		z = z >> 8;
    	}
    }


    /*	Answer the index of the high order bit of the argument, or zero if the  
    	argument is zero. */
    /*	For 64 bit uints there could be added a 32-shift. */

    function cHighBit(uint) {
    	var shifted;
    	var bitNo;

    	shifted = uint;
    	bitNo = 0;
    	if (!(shifted < (1 << 16))) {
    		shifted = shifted >>> 16;
    		bitNo += 16;
    	}
    	if (!(shifted < (1 << 8))) {
    		shifted = shifted >>> 8;
    		bitNo += 8;
    	}
    	if (!(shifted < (1 << 4))) {
    		shifted = shifted >>> 4;
    		bitNo += 4;
    	}
    	if (!(shifted < (1 << 2))) {
    		shifted = shifted >>> 2;
    		bitNo += 2;
    	}
    	if (!(shifted < (1 << 1))) {
    		shifted = shifted >>> 1;
    		++bitNo;
    	}
    	return bitNo + shifted;
    }


    /*	anOop has to be a SmallInteger! */

    function createLargeFromSmallInteger(anOop) {
    	var size;
    	var res;
    	var pByte;
    	var ix;
    	var sq_class;
    	var val;

    	val = anOop;
    	if (val < 0) {
    		sq_class = interpreterProxy.classLargeNegativeInteger();
    	} else {
    		sq_class = interpreterProxy.classLargePositiveInteger();
    	}
    	size = cDigitLengthOfCSI(val);
    	res = interpreterProxy.instantiateClassindexableSize(sq_class, size);
    	pByte = res.bytes;
    	for (ix = 1; ix <= size; ix++) {
    		pByte[ix - 1] = cDigitOfCSIat(val, ix);
    	}
    	return res;
    }


    /*	Attention: this method invalidates all oop's! Only newBytes is valid at return. */
    /*	Does not normalize. */

    function digitLshift(aBytesOop, shiftCount) {
    	var newLen;
    	var oldLen;
    	var newBytes;
    	var highBit;

    	oldLen = BYTESIZEOF(aBytesOop);
    	if (((highBit = cDigitHighBitlen(aBytesOop.bytes, oldLen))) === 0) {
    		return 0;
    	}
    	newLen = ((highBit + shiftCount) + 7) >> 3;
    	newBytes = interpreterProxy.instantiateClassindexableSize(CLASSOF(aBytesOop), newLen);
    	cDigitLshiftfromlentolen(shiftCount, aBytesOop.bytes, oldLen, newBytes.bytes, newLen);
    	return newBytes;
    }


    /*	Attention: this method invalidates all oop's! Only newBytes is valid at return. */
    /*	Shift right shiftCount bits, 0<=shiftCount.         
    	Discard all digits beyond a, and all zeroes at or below a. */
    /*	Does not normalize. */

    function digitRshiftlookfirst(aBytesOop, shiftCount, a) {
    	var newOop;
    	var oldDigitLen;
    	var newByteLen;
    	var newBitLen;
    	var oldBitLen;

    	oldBitLen = cDigitHighBitlen(aBytesOop.bytes, a);
    	oldDigitLen = (oldBitLen + 7) >> 3;
    	newBitLen = oldBitLen - shiftCount;
    	if (newBitLen <= 0) {

    		/* All bits lost */

    		return interpreterProxy.instantiateClassindexableSize(CLASSOF(aBytesOop), 0);
    	}
    	newByteLen = (newBitLen + 7) >> 3;
    	newOop = interpreterProxy.instantiateClassindexableSize(CLASSOF(aBytesOop), newByteLen);
    	cDigitRshiftfromlentolen(shiftCount, aBytesOop.bytes, oldDigitLen, newOop.bytes, newByteLen);
    	return newOop;
    }


    /*	Does not need to normalize! */

    function digitAddLargewith(firstInteger, secondInteger) {
    	var sum;
    	var shortLen;
    	var over;
    	var shortInt;
    	var resClass;
    	var newSum;
    	var longLen;
    	var firstLen;
    	var secondLen;
    	var longInt;

    	firstLen = BYTESIZEOF(firstInteger);
    	secondLen = BYTESIZEOF(secondInteger);
    	resClass = CLASSOF(firstInteger);
    	if (firstLen <= secondLen) {
    		shortInt = firstInteger;
    		shortLen = firstLen;
    		longInt = secondInteger;
    		longLen = secondLen;
    	} else {
    		shortInt = secondInteger;
    		shortLen = secondLen;
    		longInt = firstInteger;
    		longLen = firstLen;
    	}
    	sum = interpreterProxy.instantiateClassindexableSize(resClass, longLen);
    	over = cDigitAddlenwithleninto(shortInt.bytes, shortLen, longInt.bytes, longLen, sum.bytes);
    	if (over > 0) {

    		/* sum := sum growby: 1. */

    			newSum = interpreterProxy.instantiateClassindexableSize(resClass, longLen + 1);
    		cDigitCopyFromtolen(sum.bytes, newSum.bytes, longLen);

    		/* C index! */

    		sum = newSum;
    		sum.bytes[longLen] = over;
    	}
    	return sum;
    }


    /*	Bit logic here is only implemented for positive integers or Zero;
    	if rec or arg is negative, it fails. */

    function digitBitLogicwithopIndex(firstInteger, secondInteger, opIx) {
    	var shortLen;
    	var shortLarge;
    	var firstLarge;
    	var secondLarge;
    	var longLen;
    	var longLarge;
    	var firstLen;
    	var secondLen;
    	var result;

    	if (typeof firstInteger === "number") {
    		if (firstInteger < 0) {
    			return interpreterProxy.primitiveFail();
    		}
    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		if (CLASSOF(firstInteger) === interpreterProxy.classLargeNegativeInteger()) {
    			return interpreterProxy.primitiveFail();
    		}
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {
    		if (secondInteger < 0) {
    			return interpreterProxy.primitiveFail();
    		}
    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		if (CLASSOF(secondInteger) === interpreterProxy.classLargeNegativeInteger()) {
    			return interpreterProxy.primitiveFail();
    		}
    		secondLarge = secondInteger;
    	}
    	firstLen = BYTESIZEOF(firstLarge);
    	secondLen = BYTESIZEOF(secondLarge);
    	if (firstLen < secondLen) {
    		shortLen = firstLen;
    		shortLarge = firstLarge;
    		longLen = secondLen;
    		longLarge = secondLarge;
    	} else {
    		shortLen = secondLen;
    		shortLarge = secondLarge;
    		longLen = firstLen;
    		longLarge = firstLarge;
    	}
    	result = interpreterProxy.instantiateClassindexableSize(interpreterProxy.classLargePositiveInteger(), longLen);
    	cDigitOpshortlenlongleninto(opIx, shortLarge.bytes, shortLen, longLarge.bytes, longLen, result.bytes);
    	if (interpreterProxy.failed()) {
    		return 0;
    	}
    	return normalizePositive(result);
    }


    /*	Compare the magnitude of firstInteger with that of secondInteger.      
    	Return a code of 1, 0, -1 for firstInteger >, = , < secondInteger */

    function digitCompareLargewith(firstInteger, secondInteger) {
    	var secondLen;
    	var firstLen;

    	firstLen = BYTESIZEOF(firstInteger);
    	secondLen = BYTESIZEOF(secondInteger);
    	if (secondLen !== firstLen) {
    		if (secondLen > firstLen) {
    			return -1;
    		} else {
    			return 1;
    		}
    	}
    	return cDigitComparewithlen(firstInteger.bytes, secondInteger.bytes, firstLen);
    }


    /*	Does not normalize. */
    /*	Division by zero has to be checked in caller. */

    function digitDivLargewithnegative(firstInteger, secondInteger, neg) {
    	var resultClass;
    	var result;
    	var rem;
    	var div;
    	var quo;
    	var d;
    	var l;
    	var secondLen;
    	var firstLen;

    	firstLen = BYTESIZEOF(firstInteger);
    	secondLen = BYTESIZEOF(secondInteger);
    	if (neg) {
    		resultClass = interpreterProxy.classLargeNegativeInteger();
    	} else {
    		resultClass = interpreterProxy.classLargePositiveInteger();
    	}
    	l = (firstLen - secondLen) + 1;
    	if (l <= 0) {
    			result = interpreterProxy.instantiateClassindexableSize(interpreterProxy.classArray(), 2);
    		interpreterProxy.stObjectatput(result,1,0);
    		interpreterProxy.stObjectatput(result,2,firstInteger);
    		return result;
    	}
    	d = 8 - cHighBit(unsafeByteOfat(secondInteger, secondLen));
    	div = digitLshift(secondInteger, d);
    div = bytesOrIntgrowTo(div, digitLength(div) + 1);
    	rem = digitLshift(firstInteger, d);
    if (digitLength(rem) === firstLen) {
    	rem = bytesOrIntgrowTo(rem, firstLen + 1);
    }
    	quo = interpreterProxy.instantiateClassindexableSize(resultClass, l);
    	cDigitDivlenremlenquolen(div.bytes, digitLength(div), rem.bytes, digitLength(rem), quo.bytes, digitLength(quo));
    	rem = digitRshiftlookfirst(rem, d, digitLength(div) - 1);
    	result = interpreterProxy.instantiateClassindexableSize(interpreterProxy.classArray(), 2);
    	interpreterProxy.stObjectatput(result,1,quo);
    	interpreterProxy.stObjectatput(result,2,rem);
    	return result;
    }

    function digitLength(oop) {
    	if (typeof oop === "number") {
    		return cDigitLengthOfCSI(oop);
    	} else {
    		return BYTESIZEOF(oop);
    	}
    }

    function digitMontgomerytimesmodulomInvModB(firstLarge, secondLarge, thirdLarge, mInv) {
    	var prod;
    	var thirdLen;
    	var firstLen;
    	var secondLen;

    	firstLen = BYTESIZEOF(firstLarge);
    	secondLen = BYTESIZEOF(secondLarge);
    	thirdLen = BYTESIZEOF(thirdLarge);
    	if (!(firstLen <= thirdLen)) {
    		return interpreterProxy.primitiveFail();
    	}
    	if (!(secondLen <= thirdLen)) {
    		return interpreterProxy.primitiveFail();
    	}
    	if (!((mInv >= 0) && (mInv <= 255))) {
    		return interpreterProxy.primitiveFail();
    	}
    	prod = interpreterProxy.instantiateClassindexableSize(interpreterProxy.classLargePositiveInteger(), thirdLen);
    	cDigitMontgomerylentimeslenmodulolenmInvModBinto(firstLarge.bytes, firstLen, secondLarge.bytes, secondLen, thirdLarge.bytes, thirdLen, mInv, prod.bytes);
    	return normalizePositive(prod);
    }


    /*	Normalizes. */

    function digitMultiplyLargewithnegative(firstInteger, secondInteger, neg) {
    	var longInt;
    	var resultClass;
    	var shortLen;
    	var shortInt;
    	var longLen;
    	var prod;
    	var secondLen;
    	var firstLen;

    	firstLen = BYTESIZEOF(firstInteger);
    	secondLen = BYTESIZEOF(secondInteger);
    	if (firstLen <= secondLen) {
    		shortInt = firstInteger;
    		shortLen = firstLen;
    		longInt = secondInteger;
    		longLen = secondLen;
    	} else {
    		shortInt = secondInteger;
    		shortLen = secondLen;
    		longInt = firstInteger;
    		longLen = firstLen;
    	}
    	if (neg) {
    		resultClass = interpreterProxy.classLargeNegativeInteger();
    	} else {
    		resultClass = interpreterProxy.classLargePositiveInteger();
    	}
    	prod = interpreterProxy.instantiateClassindexableSize(resultClass, longLen + shortLen);
    	cDigitMultiplylenwithleninto(shortInt.bytes, shortLen, longInt.bytes, longLen, prod.bytes);
    	return normalize(prod);
    }


    /*	Argument has to be aLargeInteger! */

    function digitOfBytesat(aBytesOop, ix) {
    	if (ix > BYTESIZEOF(aBytesOop)) {
    		return 0;
    	} else {
    		return unsafeByteOfat(aBytesOop, ix);
    	}
    }


    /*	Normalizes. */

    function digitSubLargewith(firstInteger, secondInteger) {
    	var smallerLen;
    	var larger;
    	var res;
    	var smaller;
    	var resLen;
    	var largerLen;
    	var firstNeg;
    	var firstLen;
    	var secondLen;
    	var neg;

    	firstNeg = CLASSOF(firstInteger) === interpreterProxy.classLargeNegativeInteger();
    	firstLen = BYTESIZEOF(firstInteger);
    	secondLen = BYTESIZEOF(secondInteger);
    	if (firstLen === secondLen) {
    		while ((firstLen > 1) && (digitOfBytesat(firstInteger, firstLen) === digitOfBytesat(secondInteger, firstLen))) {
    			--firstLen;
    		}
    		secondLen = firstLen;
    	}
    	if ((firstLen < secondLen) || ((firstLen === secondLen) && (digitOfBytesat(firstInteger, firstLen) < digitOfBytesat(secondInteger, firstLen)))) {
    		larger = secondInteger;
    		largerLen = secondLen;
    		smaller = firstInteger;
    		smallerLen = firstLen;
    		neg = firstNeg === false;
    	} else {
    		larger = firstInteger;
    		largerLen = firstLen;
    		smaller = secondInteger;
    		smallerLen = secondLen;
    		neg = firstNeg;
    	}
    	resLen = largerLen;
    	res = interpreterProxy.instantiateClassindexableSize((neg
    	? interpreterProxy.classLargeNegativeInteger()
    	: interpreterProxy.classLargePositiveInteger()), resLen);
    	cDigitSublenwithleninto(smaller.bytes, smallerLen, larger.bytes, largerLen, res.bytes);
    	return (neg
    		? normalizeNegative(res)
    		: normalizePositive(res));
    }


    /*	Note: This is hardcoded so it can be run from Squeak.
    	The module name is used for validating a module *after*
    	it is loaded to check if it does really contain the module
    	we're thinking it contains. This is important! */

    function getModuleName() {
    	return moduleName;
    }

    function highBitOfBytes(aBytesOop) {
    	return cDigitHighBitlen(aBytesOop.bytes, BYTESIZEOF(aBytesOop));
    }

    function isNormalized(anInteger) {
    	var ix;
    	var len;
    	var sLen;
    	var minVal;
    	var maxVal;

    	if (typeof anInteger === "number") {
    		return true;
    	}
    	len = digitLength(anInteger);
    	if (len === 0) {
    		return false;
    	}
    	if (unsafeByteOfat(anInteger, len) === 0) {
    		return false;
    	}

    	/* maximal digitLength of aSmallInteger */

    	sLen = 4;
    	if (len > sLen) {
    		return true;
    	}
    	if (len < sLen) {
    		return false;
    	}
    	if (CLASSOF(anInteger) === interpreterProxy.classLargePositiveInteger()) {

    		/* SmallInteger maxVal */
    		/* all bytes of maxVal but the highest one are just FF's */

    		maxVal = 1073741823;
    		return unsafeByteOfat(anInteger, sLen) > cDigitOfCSIat(maxVal, sLen);
    	} else {

    		/* SmallInteger minVal */
    		/* all bytes of minVal but the highest one are just 00's */

    		minVal = -1073741824;
    		if (unsafeByteOfat(anInteger, sLen) < cDigitOfCSIat(minVal, sLen)) {
    			return false;
    		} else {

    			/* if just one digit differs, then anInteger < minval (the corresponding digit byte is greater!)
    						and therefore a LargeNegativeInteger */

    			for (ix = 1; ix <= sLen; ix++) {
    				if (unsafeByteOfat(anInteger, ix) !== cDigitOfCSIat(minVal, ix)) {
    					return true;
    				}
    			}
    		}
    	}
    	return false;
    }


    /*	Check for leading zeroes and return shortened copy if so. */

    function normalize(aLargeInteger) {
    	// missing DebugCode;
    	if (CLASSOF(aLargeInteger) === interpreterProxy.classLargePositiveInteger()) {
    		return normalizePositive(aLargeInteger);
    	} else {
    		return normalizeNegative(aLargeInteger);
    	}
    }


    /*	Check for leading zeroes and return shortened copy if so. */
    /*	First establish len = significant length. */

    function normalizeNegative(aLargeNegativeInteger) {
    	var i;
    	var len;
    	var sLen;
    	var minVal;
    	var oldLen;
    	var val;

    	len = (oldLen = digitLength(aLargeNegativeInteger));
    	while ((len !== 0) && (unsafeByteOfat(aLargeNegativeInteger, len) === 0)) {
    		--len;
    	}
    	if (len === 0) {
    		return 0;
    	}

    	/* SmallInteger minVal digitLength */

    	sLen = 4;
    	if (len <= sLen) {

    		/* SmallInteger minVal */

    		minVal = -1073741824;
    		if ((len < sLen) || (digitOfBytesat(aLargeNegativeInteger, sLen) < cDigitOfCSIat(minVal, sLen))) {

    			/* If high digit less, then can be small */

    			val = 0;
    			for (i = len; i >= 1; i += -1) {
    				val = (val * 256) - unsafeByteOfat(aLargeNegativeInteger, i);
    			}
    			return val;
    		}
    		for (i = 1; i <= sLen; i++) {

    			/* If all digits same, then = minVal (sr: minVal digits 1 to 3 are 
    				          0) */

    			if (digitOfBytesat(aLargeNegativeInteger, i) !== cDigitOfCSIat(minVal, i)) {

    				/* Not so; return self shortened */

    				if (len < oldLen) {

    					/* ^ self growto: len */

    					return bytesgrowTo(aLargeNegativeInteger, len);
    				} else {
    					return aLargeNegativeInteger;
    				}
    			}
    		}
    		return minVal;
    	}
    	if (len < oldLen) {

    		/* ^ self growto: len */

    		return bytesgrowTo(aLargeNegativeInteger, len);
    	} else {
    		return aLargeNegativeInteger;
    	}
    }


    /*	Check for leading zeroes and return shortened copy if so. */
    /*	First establish len = significant length. */

    function normalizePositive(aLargePositiveInteger) {
    	var i;
    	var len;
    	var sLen;
    	var val;
    	var oldLen;

    	len = (oldLen = digitLength(aLargePositiveInteger));
    	while ((len !== 0) && (unsafeByteOfat(aLargePositiveInteger, len) === 0)) {
    		--len;
    	}
    	if (len === 0) {
    		return 0;
    	}

    	/* SmallInteger maxVal digitLength. */

    	sLen = 4;
    	if ((len <= sLen) && (digitOfBytesat(aLargePositiveInteger, sLen) <= cDigitOfCSIat(1073741823, sLen))) {

    		/* If so, return its SmallInt value */

    		val = 0;
    		for (i = len; i >= 1; i += -1) {
    			val = (val * 256) + unsafeByteOfat(aLargePositiveInteger, i);
    		}
    		return val;
    	}
    	if (len < oldLen) {

    		/* ^ self growto: len */

    		return bytesgrowTo(aLargePositiveInteger, len);
    	} else {
    		return aLargePositiveInteger;
    	}
    }

    function primAnyBitFromTo() {
    	var integer;
    	var large;
    	var from;
    	var to;
    	var _return_value;

    	from = interpreterProxy.stackIntegerValue(1);
    	to = interpreterProxy.stackIntegerValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	integer = interpreterProxy.stackValue(2);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof integer === "number") {

    		/* convert it to a not normalized LargeInteger */

    		large = createLargeFromSmallInteger(integer);
    	} else {
    		large = integer;
    	}
    	_return_value = (anyBitOfBytesfromto(large, from, to)? interpreterProxy.trueObject() : interpreterProxy.falseObject());
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(3, _return_value);
    	return null;
    }


    /*	Converts a SmallInteger into a - non normalized! - LargeInteger;          
    	 aLargeInteger will be returned unchanged. */
    /*	Do not check for forced fail, because we need this conversion to test the 
    	plugin in ST during forced fail, too. */

    function primAsLargeInteger() {
    	var anInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	anInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof anInteger === "number") {
    		_return_value = createLargeFromSmallInteger(anInteger);
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, _return_value);
    		return null;
    	} else {
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, anInteger);
    		return null;
    	}
    }


    /*	If calling this primitive fails, then C module does not exist. Do not check for forced fail, because we want to know if module exists during forced fail, too. */

    function primCheckIfCModuleExists() {
    	var _return_value;

    	_return_value = ( interpreterProxy.trueObject() );
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(1, _return_value);
    	return null;
    }

    function _primDigitBitShift() {
    	var rShift;
    	var aLarge;
    	var anInteger;
    	var shiftCount;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	anInteger = interpreterProxy.stackValue(1);
    	shiftCount = interpreterProxy.stackIntegerValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof anInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    		aLarge = createLargeFromSmallInteger(anInteger);
    	} else {
    		aLarge = anInteger;
    	}
    	if (shiftCount >= 0) {
    		_return_value = digitLshift(aLarge, shiftCount);
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(3, _return_value);
    		return null;
    	} else {
    		rShift = 0 - shiftCount;
    		_return_value = normalize(digitRshiftlookfirst(aLarge, rShift, BYTESIZEOF(aLarge)));
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(3, _return_value);
    		return null;
    	}
    }

    function primDigitAdd() {
    	var firstLarge;
    	var firstInteger;
    	var secondLarge;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondLarge = secondInteger;
    	}
    	_return_value = digitAddLargewith(firstLarge, secondLarge);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(2, _return_value);
    	return null;
    }

    function primDigitAddWith() {
    	var firstLarge;
    	var secondLarge;
    	var firstInteger;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondLarge = secondInteger;
    	}
    	_return_value = digitAddLargewith(firstLarge, secondLarge);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(3, _return_value);
    	return null;
    }


    /*	Bit logic here is only implemented for positive integers or Zero; if rec 
    	or arg is negative, it fails. */

    function primDigitBitAnd() {
    	var firstInteger;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	_return_value = digitBitLogicwithopIndex(firstInteger, secondInteger, andOpIndex);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(2, _return_value);
    	return null;
    }


    /*	Bit logic here is only implemented for positive integers or Zero; if any arg is negative, it fails. */

    function primDigitBitLogicWithOp() {
    	var firstInteger;
    	var secondInteger;
    	var opIndex;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	firstInteger = interpreterProxy.stackValue(2);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	secondInteger = interpreterProxy.stackValue(1);
    	opIndex = interpreterProxy.stackIntegerValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	_return_value = digitBitLogicwithopIndex(firstInteger, secondInteger, opIndex);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(4, _return_value);
    	return null;
    }


    /*	Bit logic here is only implemented for positive integers or Zero; if rec 
    	or arg is negative, it fails. */

    function primDigitBitOr() {
    	var firstInteger;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	_return_value = digitBitLogicwithopIndex(firstInteger, secondInteger, orOpIndex);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(2, _return_value);
    	return null;
    }

    function primDigitBitShift() {
    	var aLarge;
    	var rShift;
    	var anInteger;
    	var shiftCount;
    	var _return_value;

    	shiftCount = interpreterProxy.stackIntegerValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	anInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof anInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    		aLarge = createLargeFromSmallInteger(anInteger);
    	} else {
    		aLarge = anInteger;
    	}
    	if (shiftCount >= 0) {
    		_return_value = digitLshift(aLarge, shiftCount);
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, _return_value);
    		return null;
    	} else {
    		rShift = 0 - shiftCount;
    		_return_value = normalize(digitRshiftlookfirst(aLarge, rShift, BYTESIZEOF(aLarge)));
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, _return_value);
    		return null;
    	}
    }

    function primDigitBitShiftMagnitude() {
    	var aLarge;
    	var rShift;
    	var anInteger;
    	var shiftCount;
    	var _return_value;

    	shiftCount = interpreterProxy.stackIntegerValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	anInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof anInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    		aLarge = createLargeFromSmallInteger(anInteger);
    	} else {
    		aLarge = anInteger;
    	}
    	if (shiftCount >= 0) {
    		_return_value = digitLshift(aLarge, shiftCount);
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, _return_value);
    		return null;
    	} else {
    		rShift = 0 - shiftCount;
    		_return_value = normalize(digitRshiftlookfirst(aLarge, rShift, BYTESIZEOF(aLarge)));
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, _return_value);
    		return null;
    	}
    }


    /*	Bit logic here is only implemented for positive integers or Zero; if rec 
    	or arg is negative, it fails. */

    function primDigitBitXor() {
    	var firstInteger;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	_return_value = digitBitLogicwithopIndex(firstInteger, secondInteger, xorOpIndex);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(2, _return_value);
    	return null;
    }

    function primDigitCompare() {
    	var firstVal;
    	var firstInteger;
    	var secondVal;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* first */

    		if (typeof secondInteger === "number") {

    			/* second */

    			if (((firstVal = firstInteger)) > ((secondVal = secondInteger))) {
    				_return_value = 1;
    				if (interpreterProxy.failed()) {
    					return null;
    				}
    				interpreterProxy.popthenPush(2, _return_value);
    				return null;
    			} else {
    				if (firstVal < secondVal) {
    					_return_value = -1;
    					if (interpreterProxy.failed()) {
    						return null;
    					}
    					interpreterProxy.popthenPush(2, _return_value);
    					return null;
    				} else {
    					_return_value = 0;
    					if (interpreterProxy.failed()) {
    						return null;
    					}
    					interpreterProxy.popthenPush(2, _return_value);
    					return null;
    				}
    			}
    		} else {

    			/* SECOND */

    			_return_value = -1;
    			if (interpreterProxy.failed()) {
    				return null;
    			}
    			interpreterProxy.popthenPush(2, _return_value);
    			return null;
    		}
    	} else {

    		/* FIRST */

    		if (typeof secondInteger === "number") {

    			/* second */

    			_return_value = 1;
    			if (interpreterProxy.failed()) {
    				return null;
    			}
    			interpreterProxy.popthenPush(2, _return_value);
    			return null;
    		} else {

    			/* SECOND */

    			_return_value = digitCompareLargewith(firstInteger, secondInteger);
    			if (interpreterProxy.failed()) {
    				return null;
    			}
    			interpreterProxy.popthenPush(2, _return_value);
    			return null;
    		}
    	}
    }

    function primDigitCompareWith() {
    	var firstVal;
    	var secondVal;
    	var firstInteger;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* first */

    		if (typeof secondInteger === "number") {

    			/* second */

    			if (((firstVal = firstInteger)) > ((secondVal = secondInteger))) {
    				_return_value = 1;
    				if (interpreterProxy.failed()) {
    					return null;
    				}
    				interpreterProxy.popthenPush(3, _return_value);
    				return null;
    			} else {
    				if (firstVal < secondVal) {
    					_return_value = -1;
    					if (interpreterProxy.failed()) {
    						return null;
    					}
    					interpreterProxy.popthenPush(3, _return_value);
    					return null;
    				} else {
    					_return_value = 0;
    					if (interpreterProxy.failed()) {
    						return null;
    					}
    					interpreterProxy.popthenPush(3, _return_value);
    					return null;
    				}
    			}
    		} else {

    			/* SECOND */

    			_return_value = -1;
    			if (interpreterProxy.failed()) {
    				return null;
    			}
    			interpreterProxy.popthenPush(3, _return_value);
    			return null;
    		}
    	} else {

    		/* FIRST */

    		if (typeof secondInteger === "number") {

    			/* second */

    			_return_value = 1;
    			if (interpreterProxy.failed()) {
    				return null;
    			}
    			interpreterProxy.popthenPush(3, _return_value);
    			return null;
    		} else {

    			/* SECOND */

    			_return_value = digitCompareLargewith(firstInteger, secondInteger);
    			if (interpreterProxy.failed()) {
    				return null;
    			}
    			interpreterProxy.popthenPush(3, _return_value);
    			return null;
    		}
    	}
    }


    /*	Answer the result of dividing firstInteger by secondInteger. 
    	Fail if parameters are not integers, not normalized or secondInteger is 
    	zero.  */

    function primDigitDivNegative() {
    	var firstAsLargeInteger;
    	var firstInteger;
    	var secondAsLargeInteger;
    	var secondInteger;
    	var neg;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	secondInteger = interpreterProxy.stackValue(1);
    	neg = interpreterProxy.booleanValueOf(interpreterProxy.stackValue(0));
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	firstInteger = interpreterProxy.stackValue(2);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (!isNormalized(firstInteger)) {
    		// missing DebugCode;
    		interpreterProxy.primitiveFail();
    		return null;
    	}
    	if (!isNormalized(secondInteger)) {
    		// missing DebugCode;
    		interpreterProxy.primitiveFail();
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert to LargeInteger */

    			firstAsLargeInteger = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstAsLargeInteger = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* check for zerodivide and convert to LargeInteger */

    		if (secondInteger === 0) {
    			interpreterProxy.primitiveFail();
    			return null;
    		}
    			secondAsLargeInteger = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondAsLargeInteger = secondInteger;
    	}
    	_return_value = digitDivLargewithnegative(firstAsLargeInteger, secondAsLargeInteger, neg);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(3, _return_value);
    	return null;
    }


    /*	Answer the result of dividing firstInteger by secondInteger.
    	Fail if parameters are not integers or secondInteger is zero. */

    function primDigitDivWithNegative() {
    	var firstAsLargeInteger;
    	var secondAsLargeInteger;
    	var firstInteger;
    	var secondInteger;
    	var neg;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	firstInteger = interpreterProxy.stackValue(2);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	secondInteger = interpreterProxy.stackValue(1);
    	neg = interpreterProxy.booleanValueOf(interpreterProxy.stackValue(0));
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert to LargeInteger */

    			firstAsLargeInteger = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstAsLargeInteger = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* check for zerodivide and convert to LargeInteger */

    		if (secondInteger === 0) {
    			interpreterProxy.primitiveFail();
    			return null;
    		}
    			secondAsLargeInteger = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondAsLargeInteger = secondInteger;
    	}
    	_return_value = digitDivLargewithnegative(firstAsLargeInteger, secondAsLargeInteger, neg);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(4, _return_value);
    	return null;
    }

    function primDigitMultiplyNegative() {
    	var firstLarge;
    	var firstInteger;
    	var secondLarge;
    	var secondInteger;
    	var neg;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	secondInteger = interpreterProxy.stackValue(1);
    	neg = interpreterProxy.booleanValueOf(interpreterProxy.stackValue(0));
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	firstInteger = interpreterProxy.stackValue(2);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondLarge = secondInteger;
    	}
    	_return_value = digitMultiplyLargewithnegative(firstLarge, secondLarge, neg);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(3, _return_value);
    	return null;
    }

    function primDigitMultiplyWithNegative() {
    	var firstLarge;
    	var secondLarge;
    	var firstInteger;
    	var secondInteger;
    	var neg;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	firstInteger = interpreterProxy.stackValue(2);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	secondInteger = interpreterProxy.stackValue(1);
    	neg = interpreterProxy.booleanValueOf(interpreterProxy.stackValue(0));
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondLarge = secondInteger;
    	}
    	_return_value = digitMultiplyLargewithnegative(firstLarge, secondLarge, neg);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(4, _return_value);
    	return null;
    }

    function primDigitSubtract() {
    	var firstLarge;
    	var firstInteger;
    	var secondLarge;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondLarge = secondInteger;
    	}
    	_return_value = digitSubLargewith(firstLarge, secondLarge);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(2, _return_value);
    	return null;
    }

    function primDigitSubtractWith() {
    	var firstLarge;
    	var secondLarge;
    	var firstInteger;
    	var secondInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	firstInteger = interpreterProxy.stackValue(1);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	secondInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondInteger);
    	} else {
    		secondLarge = secondInteger;
    	}
    	_return_value = digitSubLargewith(firstLarge, secondLarge);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(3, _return_value);
    	return null;
    }


    /*	If calling this primitive fails, then C module does not exist. */

    function primGetModuleName() {
    	var strPtr;
    	var strLen;
    	var i;
    	var strOop;

    	// missing DebugCode;
    	strLen = getModuleName().length;
    	strOop = interpreterProxy.instantiateClassindexableSize(interpreterProxy.classString(), strLen);
    	strPtr = strOop.bytes;
    	for (i = 0; i <= (strLen - 1); i++) {
    		strPtr[i] = getModuleName()[i];
    	}
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(1, strOop);
    	return null;
    }

    function primMontgomeryTimesModulo() {
    	var firstLarge;
    	var secondLarge;
    	var firstInteger;
    	var thirdLarge;
    	var secondOperandInteger;
    	var thirdModuloInteger;
    	var smallInverseInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(2)));
    	secondOperandInteger = interpreterProxy.stackValue(2);
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(1)));
    	thirdModuloInteger = interpreterProxy.stackValue(1);
    	smallInverseInteger = interpreterProxy.stackIntegerValue(0);
    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(3)));
    	firstInteger = interpreterProxy.stackValue(3);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof firstInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			firstLarge = createLargeFromSmallInteger(firstInteger);
    	} else {
    		firstLarge = firstInteger;
    	}
    	if (typeof secondOperandInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			secondLarge = createLargeFromSmallInteger(secondOperandInteger);
    	} else {
    		secondLarge = secondOperandInteger;
    	}
    	if (typeof thirdModuloInteger === "number") {

    		/* convert it to a not normalized LargeInteger */

    			thirdLarge = createLargeFromSmallInteger(thirdModuloInteger);
    	} else {
    		thirdLarge = thirdModuloInteger;
    	}
    	_return_value = digitMontgomerytimesmodulomInvModB(firstLarge, secondLarge, thirdLarge, smallInverseInteger);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(4, _return_value);
    	return null;
    }


    /*	Parameter specification #(Integer) doesn't convert! */

    function primNormalize() {
    	var anInteger;
    	var _return_value;

    	interpreterProxy.success(interpreterProxy.isKindOfInteger(interpreterProxy.stackValue(0)));
    	anInteger = interpreterProxy.stackValue(0);
    	// missing DebugCode;
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	if (typeof anInteger === "number") {
    		if (interpreterProxy.failed()) {
    			return null;
    		}
    		interpreterProxy.popthenPush(2, anInteger);
    		return null;
    	}
    	_return_value = normalize(anInteger);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(2, _return_value);
    	return null;
    }

    function primNormalizeNegative() {
    	var rcvr;
    	var _return_value;

    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.stackValue(0).sqClass === interpreterProxy.classLargeNegativeInteger());
    	rcvr = interpreterProxy.stackValue(0);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	_return_value = normalizeNegative(rcvr);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(1, _return_value);
    	return null;
    }

    function primNormalizePositive() {
    	var rcvr;
    	var _return_value;

    	// missing DebugCode;
    	interpreterProxy.success(interpreterProxy.stackValue(0).sqClass === interpreterProxy.classLargePositiveInteger());
    	rcvr = interpreterProxy.stackValue(0);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	_return_value = normalizePositive(rcvr);
    	if (interpreterProxy.failed()) {
    		return null;
    	}
    	interpreterProxy.popthenPush(1, _return_value);
    	return null;
    }


    /*	Note: This is coded so that is can be run from Squeak. */

    function setInterpreter(anInterpreter) {
    	var ok;

    	interpreterProxy = anInterpreter;
    	ok = interpreterProxy.majorVersion() == VM_PROXY_MAJOR;
    	if (ok === false) {
    		return false;
    	}
    	ok = interpreterProxy.minorVersion() >= VM_PROXY_MINOR;
    	return ok;
    }


    /*	Argument bytesOop must not be aSmallInteger! */

    function unsafeByteOfat(bytesOop, ix) {
    	var pointer;

    	return ((pointer = bytesOop.bytes))[ix - 1];
    }


    function registerPlugin() {
    	if (typeof Squeak === "object" && Squeak.registerExternalModule) {
    		Squeak.registerExternalModule("LargeIntegers", {
    			primDigitAddWith: primDigitAddWith,
    			primDigitBitShiftMagnitude: primDigitBitShiftMagnitude,
    			primGetModuleName: primGetModuleName,
    			primDigitBitLogicWithOp: primDigitBitLogicWithOp,
    			primCheckIfCModuleExists: primCheckIfCModuleExists,
    			primDigitCompare: primDigitCompare,
    			primDigitMultiplyNegative: primDigitMultiplyNegative,
    			primDigitBitShift: primDigitBitShift,
    			primNormalizePositive: primNormalizePositive,
    			primDigitSubtractWith: primDigitSubtractWith,
    			_primDigitBitShift: _primDigitBitShift,
    			primDigitMultiplyWithNegative: primDigitMultiplyWithNegative,
    			primDigitSubtract: primDigitSubtract,
    			primDigitDivNegative: primDigitDivNegative,
    			primNormalizeNegative: primNormalizeNegative,
    			primDigitBitOr: primDigitBitOr,
    			primMontgomeryTimesModulo: primMontgomeryTimesModulo,
    			primDigitBitAnd: primDigitBitAnd,
    			primDigitDivWithNegative: primDigitDivWithNegative,
    			setInterpreter: setInterpreter,
    			primNormalize: primNormalize,
    			primDigitBitXor: primDigitBitXor,
    			primDigitCompareWith: primDigitCompareWith,
    			primDigitAdd: primDigitAdd,
    			getModuleName: getModuleName,
    			primAsLargeInteger: primAsLargeInteger,
    			primAnyBitFromTo: primAnyBitFromTo,
    		});
    	} else self.setTimeout(registerPlugin, 100);
    }

    registerPlugin();

    })(); // Register module/plugin

    function CpSystemPlugin() {

      return {
        getModuleName: function() { return "CpSystemPlugin"; },
        interpreterProxy: null,
        primHandler: null,

        setInterpreter: function(anInterpreter) {
          this.interpreterProxy = anInterpreter;
          this.primHandler = this.interpreterProxy.vm.primHandler;
          this.symbolClass = this.interpreterProxy.vm.globalNamed("Symbol");
          this.stringClass = this.interpreterProxy.vm.globalNamed("String");
          this.byteStringClass = this.interpreterProxy.vm.globalNamed("ByteString");
          this.wideStringClass = this.interpreterProxy.vm.globalNamed("WideString");
          this.arrayClass = this.interpreterProxy.vm.globalNamed("Array");
          this.dictionaryClass = this.interpreterProxy.vm.globalNamed("Dictionary");

          // Add #asString behavior to String classes (converting from Smalltalk to Javascript Strings)
          this.stringClass.classInstProto().prototype.asString = function() {
            var charChunks = [];
            var src = this.bytes || this.words || [];
            for(var i = 0; i < src.length;) {
              charChunks.push(String.fromCodePoint.apply(null, src.subarray(i, i += 16348)));
            }
            return charChunks.join('');
          };

          // Replace makeStString behavior to support WideStrings
          var thisHandle = this;
          Squeak.Primitives.prototype.makeStString = function(string) {
            var isWideString = false;
            // Will make surrogates pairs into single elements (which then get converted into codepoints)
            var src = Array.from(string).map(function(char) {
              var charValue = char.codePointAt(0);
              if(charValue >= 256) {
                isWideString = true;
              }
              return charValue;
            });
            var newString = thisHandle.interpreterProxy.vm.instantiateClass(isWideString ? thisHandle.wideStringClass : thisHandle.byteStringClass, src.length);
            var dst = newString.bytes || newString.words || [];
            for(var i = 0; i < src.length; i++) {
              dst[i] = src[i];
            }
            return newString;
          };

          return true;
        },

        // Helper methods for answering (and setting the stack correctly)
        answer: function(argCount, value) {
          // Pop arguments and receiver and push result
          this.interpreterProxy.popthenPush(argCount + 1, this.primHandler.makeStObject(value));
          return true;
        },
        answerSelf: function(argCount) {
          // Leave self on stack and only pop arguments
          this.interpreterProxy.pop(argCount);
          return true;
        },

        // Helper methods for converting from Smalltalk object to Javascript object and vice versa
        asJavascriptObject: function(obj) {
          if(obj.isNil) {
            return null;
          } else if(obj.isTrue) {
            return true;
          } else if(obj.isFalse) {
            return false;
          } else if(typeof obj === "number") {
            return obj;
          } else if(obj.isFloat) {
            return obj.float;
          } else if(obj.sqClass === this.arrayClass) {
            return this.arrayAsJavascriptObject(obj);
          } else if(obj.sqClass === this.dictionaryClass) {
            return this.dictionaryAsJavascriptObject(obj);
          } else if(obj.domElement) {
            return obj.domElement;
          }
          // Assume a String is used otherwise
          return obj.asString();
        },
        arrayAsJavascriptObject: function(obj) {
          var thisHandle = this;
          return (obj.pointers || []).map(function(each) { return thisHandle.asJavascriptObject(each); });
        },
        dictionaryAsJavascriptObject: function(obj) {
          var thisHandle = this;
          var associations = obj.pointers.find(function(pointer) {
            return pointer && pointer.sqClass === thisHandle.arrayClass;
          });
          if(!associations || !associations.pointers || !associations.pointers.forEach) throw Error("Dictionary has unexpected structure");
          var result = {};
          associations.pointers.forEach(function(assoc) {
            if(!assoc.isNil) {
              // Assume instVars are #key and #value (in that order)
              result[thisHandle.asJavascriptObject(assoc.pointers[0])] = thisHandle.asJavascriptObject(assoc.pointers[1]);
            }
          });
          return result;
        },

        // Symbol class methods
        newSymbol: function(string) {
          var newSymbol = this.interpreterProxy.vm.instantiateClass(this.symbolClass, string.length);
          // Assume ByteSymbols only
          for(var i = 0; i < string.length; i++) {
              newSymbol.bytes[i] = string.charCodeAt(i) & 0xFF;
          }
          return newSymbol;
        },
        "primitiveSymbolRegister:": function(argCount) {
          if(argCount !== 1) return false;
          var symbol = this.interpreterProxy.stackValue(0);
          var symbolString = symbol.asString();
          if(!this.symbolClass.symbolTable) {
            this.symbolClass.symbolTable = {};
          }
          if(this.symbolClass.symbolTable[symbolString]) { throw Error("Registered non-unique Symbol: " + symbolString); }
          this.symbolClass.symbolTable[symbolString] = symbol;
          return this.answerSelf(argCount);
        },
        "primitiveSymbolFromString:": function(argCount) {
          if(argCount !== 1) return false;
          var string = this.interpreterProxy.stackValue(0).asString();
          if(!this.symbolClass.symbolTable) {
            this.symbolClass.symbolTable = {};
          }
          var registeredSymbol = this.symbolClass.symbolTable[string];
          if(registeredSymbol === undefined) {
            registeredSymbol = this.symbolClass.symbolTable[string] = this.newSymbol(string);
          }
          return this.answer(argCount, registeredSymbol);
        },

        // Symbol instance methods
        "primitiveSymbolEquals:": function(argCount) {
          if(argCount !== 1) return false;
          var otherObject = this.interpreterProxy.stackValue(0);
          var receiver = this.interpreterProxy.stackValue(argCount);
          var result = otherObject === receiver;
          if(!result) {
            var src = receiver.bytes || receiver.words || [];
            var dst = otherObject.bytes || otherObject.words || [];
            if(src.length === dst.length) {
              var i = 0;
              result = true;	// Assume receiver and argument are equal for now
              while(i < src.length && result) {
                if(src[i] !== dst[i]) {
                  result = false;	// A Character is different, so not equal (stop)
                } else {
                  i++;
                }
              }
            }
          }
          return this.answer(argCount, result);
        },
        "primitiveSymbolIsLiteralSymbol": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var src = receiver.bytes || receiver.words || [];
          var i = 1;
          var result = src.length > 0;
          if(result) {
            var isLetter = function(c) { return (c >= 65 && c <= 90) || (c >= 97 && c <= 122); };
            var isDigit = function(c) { return c >= 48 && c <= 57; };
            var isBinary = function(c) { return [ 33, 37, 38, 42, 43, 44, 45, 47, 60, 61, 62, 63, 64, 92, 96, 124, 215, 247 ].indexOf(c) >= 0 || (c >= 126 && c <= 191 && [ 170, 181, 186 ].indexOf(c) < 0); };
            var isColon = function(c) { return c === 58; };
            var check = isLetter(src[0]) ? function(c) { return isLetter(c) || isDigit(c) || isColon(c); } :
                        isBinary(src[0]) ? function(c) { return isBinary(c); } :
                        null;
            result = check !== null;
            while(i < src.length && result) {
              var asciiValue = src[i];
              result = check(asciiValue);
              i++;
            }
          }
          return this.answer(argCount, result);
        },

        // ByteArray instance methods
        "primitiveByteArrayAsString": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          return this.answer(argCount, receiver.asString());
        },

        // Number instance methods
        "primitiveNumberRaisedTo:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var exp = this.interpreterProxy.stackValue(0);
          var base = null;
          if(receiver.isFloat) {
            base = receiver.float;
          } else if(typeof receiver === "number") {
            base = receiver;
          }
          if(base === null) return false;
          return this.answer(argCount, Math.pow(base, exp));
        },
        "primitiveNumberPrintString": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var value = null;
          if(receiver.isFloat) {
            value = receiver.float;
          } else if(typeof receiver === "number") {
            value = receiver;
          }
          if(value === null) return false;
          return this.answer(argCount, value.toString());
        },
        "primitiveNumberPrintStringBase:": function(argCount) {
          if(argCount !== 1) return false;
          var base = this.interpreterProxy.stackValue(0);
          if(typeof base !== "number" || base < 2 || base > 36) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var value = null;
          if(receiver.isFloat) {
            // Only support for floats with base 10
            if(base === 10) {
              // Javascript already has same String representation for NaN, Infinity and -Infinity
              // No need to distinguish these here
              value = receiver.float.toString();
            }
          } else if(typeof receiver === "number") {
            value = receiver.toString(base);
          }
          if(value === null) return false;
          return this.answer(argCount, (base !== 10 ? base + "r" + value : value));
        },

        // Integer instance methods
        "primitiveIntegerAtRandom": function(argCount) {
          if(argCount !== 0) return false;
          var upperBound = this.interpreterProxy.stackValue(argCount);
          if(typeof upperBound !== "number") return false;
          return this.answer(argCount, Math.floor(Math.random() * (upperBound - 1) + 1));
        },

        // String class methods
        "primitiveStringFromWordArray:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var wordArray = this.interpreterProxy.stackValue(0);
          var src = wordArray.words || [];
          var newString = this.interpreterProxy.vm.instantiateClass(receiver, src.length);
          var dst = newString.bytes || newString.words;
          for(var i = 0; i < src.length; i++) {
            dst[i] = src[i];
          }
          return this.answer(argCount, newString);
        },

        // String instance methods
        skipDelimiters: function(src, delimiters, from) {
          for(;from < src.length; from++) {
            if(delimiters.indexOf(src[from]) < 0) {
              return from;
            }
          }
          return src.length + 1;
        },
        findDelimiters: function(src, delimiters, from) {
          for(;from < src.length; from++) {
            if(delimiters.indexOf(src[from]) >= 0) {
              return from;
            }
          }
          return src.length + 1;
        },
        createSubstring: function(src, start, end) {
          var substring = src.slice(start, end);
          var isWideString = substring.some(function(charValue) { return charValue >= 256; });
          var newString = this.interpreterProxy.vm.instantiateClass(isWideString ? this.wideStringClass : this.byteStringClass, substring.length);
          var dst = newString.bytes || newString.words || [];
          for(var i = 0; i < substring.length; i++) {
            dst[i] = substring[i];
          }
          return newString;
        },
        "primitiveStringConcatenate:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var otherString = this.interpreterProxy.stackValue(0);
          var first = receiver.bytes || receiver.words || [];
          var second = otherString.bytes || otherString.words || [];
          var isWideString = receiver.words || otherString.words || false;
          var newString = this.interpreterProxy.vm.instantiateClass(isWideString ? this.wideStringClass : this.byteStringClass, first.length + second.length);
          var dst = newString.bytes || newString.words;
          var i = 0;
          for(; i < first.length; i++) {
            dst[i] = first[i];
          }
          for(var j = 0; j < second.length; j++, i++) {
            dst[i] = second[j];
          }
          return this.answer(argCount, newString);
        },
        "primitiveStringAsciiCompare:": function(argCount) {
          if(argCount !== 1) return false;
          var otherString = this.interpreterProxy.stackValue(0);
          var receiver = this.interpreterProxy.stackValue(argCount);
          var src = receiver.bytes || receiver.words || [];
          var dst = otherString.bytes || otherString.words || [];
          var minLength = Math.min(src.length, dst.length);
          for(var i = 0; i < minLength; i++) {
            var cmp = src[i] - dst[i];
            if(cmp > 0) {
              return this.answer(argCount, 3);	// src comes after dst
            } else if(cmp < 0) {
              return this.answer(argCount, 1);	// src comes before dst
            }
          }
          if(src.length > minLength) {
            return this.answer(argCount, 3);	// src comes after dst (src is longer)
          } else if(dst.length > minLength) {
            return this.answer(argCount, 1);	// src comes before dst (src is shorter)
          }
          return this.answer(argCount, 2);		// src equals dst
        },
        "primitiveStringAsUppercase": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var src = receiver.bytes || receiver.words || [];
          var uppercaseString = this.interpreterProxy.vm.instantiateClass(receiver.sqClass, src.length);
          var dst = receiver.bytes ? uppercaseString.bytes : uppercaseString.words;
          for(var i = 0; i < src.length; i++) {
            dst[i] = String.fromCodePoint(src[i]).toUpperCase().codePointAt(0);
          }
          return this.answer(argCount, uppercaseString);
        },
        "primitiveStringAsLowercase": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var src = receiver.bytes || receiver.words || [];
          var lowercaseString = this.interpreterProxy.vm.instantiateClass(receiver.sqClass, src.length);
          var dst = receiver.bytes ? lowercaseString.bytes : lowercaseString.words;
          for(var i = 0; i < src.length; i++) {
            dst[i] = String.fromCodePoint(src[i]).toLowerCase().codePointAt(0);
          }
          return this.answer(argCount, lowercaseString);
        },
        "primitiveStringAsNumber": function(argCount) {
          if(argCount !== 0) return false;
          var numberString = this.interpreterProxy.stackValue(argCount).asString();
          var result = null;
          if(numberString === "NaN") {
            result = Number.NaN;
          } else if(numberString === "Infinity") {
            result = Number.POSITIVE_INFINITY;
          } else if(numberString === "-Infinity") {
            result = Number.NEGATIVE_INFINITY;
          } else {
            var numberMatch = numberString.match(/^(\d+r)?(-?\d+(?:\.\d+)?(?:e-?\d)?)$/);
            if(numberMatch) {
              if(numberMatch[1]) {
                // Currently only support for base/radix when using integers (not floats)
                var base = Number.parseInt(numberMatch[1]);
                if(base >= 2 && base <= 36 && numberMatch[2].indexOf(".") < 0 && numberMatch[2].indexOf("e") < 0) {
                  result = Number.parseInt(numberMatch[2], base);
                }
              } else {
                result = +numberMatch[2];
              }
            }
          }
          if(result === null) return false;
          return this.answer(argCount, result);
        },
        "primitiveStringFindTokens:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var src = receiver.bytes || receiver.words || [];
          var delimitersString = this.interpreterProxy.stackValue(0);
          var delimiters = delimitersString.bytes || delimitersString.words || [];
          var result = [];
          var keyStop = 0;
          while(keyStop < src.length) {
            var keyStart = this.skipDelimiters(src, delimiters, keyStop);
            keyStop = this.findDelimiters(src, delimiters, keyStart);
            if(keyStart < keyStop) {
              result.push(this.createSubstring(src, keyStart, keyStop));
            }
          }
          return this.answer(argCount, result);
        },
        "primitiveStringIncludesSubstring:": function(argCount) {
          if(argCount !== 1) return false;
          var src = this.interpreterProxy.stackValue(argCount).asString();
          var substring = this.interpreterProxy.stackValue(0).asString();
          return this.answer(argCount, src.indexOf(substring) >= 0);
        },
        "primitiveStringHash": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var src = receiver.bytes || receiver.words || [];
          var hash = 0x3400; // Initial value ByteString hash
          for(var i = 0; i < src.length; i++) {
            hash = hash + src[i];
            var low = hash & 0x3fff;
            hash = (0x260d * low + ((0x260d * Math.floor(hash / 0x4000) + (0x0065 * low) & 0x3fff) * 0x4000)) & 0xfffffff;
          }
          return this.answer(argCount, hash);
        },

        // WideString class methods
        "primitiveWideStringFrom:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var srcString = this.interpreterProxy.stackValue(0);
          var src = srcString.bytes || srcString.words || [];
          var newString = this.interpreterProxy.vm.instantiateClass(receiver, src.length);
          var dst = newString.words;
          for(var i = 0; i < src.length; i++) {
            dst[i] = src[i];
          }
          return this.answer(argCount, newString);
        },

        // ClientEnvironment instance methods
        "primitiveEnvironmentVariableAt:": function(argCount) {
          if(argCount !== 1) return false;
          var variableName = this.interpreterProxy.stackValue(0).asString();
          if(!variableName) return false;
          var variableValue = window.sessionStorage.getItem(variableName);
          return this.answer(argCount, variableValue);
        },
        "primitiveEnvironmentVariableAt:put:": function(argCount) {
          if(argCount !== 2) return false;
          var variableName = this.interpreterProxy.stackValue(1).asString();
          if(!variableName) return false;
          var variableValue = this.interpreterProxy.stackValue(0).asString();
          if(!variableValue) return false;
          window.sessionStorage.setItem(variableName, variableValue);
          return this.answerSelf(argCount);
        },
        "primitiveEnvironmentRemoveVariableAt:": function(argCount) {
          if(argCount !== 1) return false;
          var variableName = this.interpreterProxy.stackValue(0).asString();
          if(!variableName) return false;
          window.sessionStorage.removeItem(variableName);
          return this.answerSelf(argCount);
        },
        "primitiveEnvironmentPersistentVariableAt:": function(argCount) {
          if(argCount !== 1) return false;
          var variableName = this.interpreterProxy.stackValue(0).asString();
          if(!variableName) return false;
          var variableValue = window.localStorage.getItem(variableName);
          return this.answer(argCount, variableValue);
        },
        "primitiveEnvironmentPersistentVariableAt:put:": function(argCount) {
          if(argCount !== 2) return false;
          var variableName = this.interpreterProxy.stackValue(1).asString();
          if(!variableName) return false;
          var variableValue = this.interpreterProxy.stackValue(0).asString();
          if(!variableValue) return false;
          window.localStorage.setItem(variableName, variableValue);
          return this.answerSelf(argCount);
        },
        "primitiveEnvironmentRemovePersistentVariableAt:": function(argCount) {
          if(argCount !== 1) return false;
          var variableName = this.interpreterProxy.stackValue(0).asString();
          if(!variableName) return false;
          window.localStorage.removeItem(variableName);
          return this.answerSelf(argCount);
        },
        "primitiveEnvironmentAlert:": function(argCount) {
          if(argCount !== 1) return false;
          var message = this.interpreterProxy.stackValue(0).asString();
          window.alert(message);
          return this.answerSelf(argCount);
        },
        "primitiveEnvironmentConfirm:": function(argCount) {
          if(argCount !== 1) return false;
          var message = this.interpreterProxy.stackValue(0).asString();
          return this.answer(argCount, window.confirm(message) === true);
        },
        "primitiveEnvironmentGlobalApply:withArguments:": function(argCount) {
          if(argCount !== 2) return false;
          var functionName = this.interpreterProxy.stackValue(1).asString();
          if(!functionName) return false;
          var functionArguments = this.asJavascriptObject(this.interpreterProxy.stackValue(0));
          return this.answer(argCount, window[functionName].apply(window, functionArguments));
        },
        "primitiveEnvironmentReload": function(argCount) {
          if(argCount !== 0) return false;
          document.location.reload(true);
          return this.answerSelf(argCount);
        },
        "primitiveEnvironmentLog:": function(argCount) {
          if(argCount !== 1) return false;
          var message = this.interpreterProxy.stackValue(0).asString();
          console.log(Date.now() + " " + message);
          return this.answerSelf(argCount);
        },

        // WebSocket instance methods
        "primitiveWebSocketConnectToUrl:withEventSemaphore:": function(argCount) {
          if(argCount !== 2) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var url = this.interpreterProxy.stackValue(1).asString();
          var semaIndex = this.interpreterProxy.stackIntegerValue(0);

          // Setup WebSocket
          receiver.webSocketHandle = {
            webSocket: new WebSocket(url),
            url: url,
            semaIndex: semaIndex,
            buffers: []
          };
          this.setupWebSocket(receiver.webSocketHandle);

          return this.answerSelf(argCount);
        },
        setupWebSocket: function(webSocketHandle) {
          var thisHandle = this;
          var webSocket = webSocketHandle.webSocket;
          webSocket.onopen = function(/* event */) {
            thisHandle.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);
          };
          webSocket.onclose = function(/* event */) {
            thisHandle.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);
          };
          webSocket.onerror = function(event) {
            console.error("Failure on WebSocket for url [" + webSocketHandle.url + "]: ", event);
            thisHandle.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);
          };
          webSocket.onmessage = function(event) {
            new Response(event.data)
              .arrayBuffer()
              .then(function(data) {
                webSocketHandle.buffers.push(new Uint8Array(data));
                thisHandle.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);

                // Handle message as soon as possible
                thisHandle.interpreterProxy.vm.forceInterruptCheck();
              })
              .catch(function(error) {
                console.error("Failed to read websocket message", error);
                thisHandle.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);
              })
            ;
          };
        },
        "primitiveWebSocketReceivedMessage": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var webSocketHandle = receiver.webSocketHandle;
          if(!webSocketHandle) return false;

          // Get next receive buffer
          var receiveBuffer = webSocketHandle.buffers.splice(0, 1)[0];  // Remove first element and keep it
          var result = receiveBuffer ? this.primHandler.makeStByteArray(receiveBuffer) : this.interpreterProxy.nilObject(); 

          // Answer ByteArray or nil
          return this.answer(argCount, result);
        },
        "primitiveWebSocketSend:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var sendBuffer = this.interpreterProxy.stackObjectValue(0);
          var webSocketHandle = receiver.webSocketHandle;
          if(!webSocketHandle) return false;

          // Send buffer
          var success = false;
          if(webSocketHandle.webSocket.readyState === 1) {
            try {
              webSocketHandle.webSocket.send(sendBuffer.bytes);
              success = true;
            } catch(e) {
              console.error("Failed to write websocket message", error);
              this.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);
            }
          }
          return this.answer(argCount, success);
        },
        "primitiveWebSocketReadyState": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var webSocketHandle = receiver.webSocketHandle;
          if(!webSocketHandle) return false;
     
          // Get ready state
          var readyState = webSocketHandle.webSocket.readyState;

          return this.answer(argCount, readyState);
        },
        "primitiveWebSocketClose": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var webSocketHandle = receiver.webSocketHandle;
          if(!webSocketHandle) return false;

          // Close connection (if one still exists, ignore silently otherwise)
          var success = false;
          try {
            if(webSocketHandle.webSocket) {
              webSocketHandle.webSocket.close();
              success = true;
            }
          } catch(e) {
            console.error("Failed to close websocket", error);
            this.primHandler.signalSemaphoreWithIndex(webSocketHandle.semaIndex);
          }

          return this.answer(argCount, success);
        }
      };
    }

    function registerCpSystemPlugin() {
        if(typeof Squeak === "object" && Squeak.registerExternalModule) {
            Squeak.registerExternalModule("CpSystemPlugin", CpSystemPlugin());
        } else self.setTimeout(registerCpSystemPlugin, 100);
    }
    registerCpSystemPlugin();

    function CpDOMPlugin() {

      return {
        getModuleName: function() { return "CpDOMPlugin"; },
        interpreterProxy: null,
        primHandler: null,
        customTagMap: {},
        nestedTags: {},
        customElementClassMappers: [],
        eventDefinitions: {},
        eventsReceived: [],
        throttleEventTypes: [ "pointermove", "wheel", "gesturechange" ],
        preventDefaultEventTypes: [ "wheel" ],	// These need be applied on element level (vs only on body as in preventDefaultEventHandling)
        namespaces: [
          // Default namespaces (for attributes, therefore without elementClass)
          { prefix: "xlink", uri: "http://www.w3.org/1999/xlink", elementClass: null },
          { prefix: "xmlns", uri: "http://www.w3.org/2000/xmlns/", elementClass: null }
        ],
        domElementMap: new WeakMap(),

        setInterpreter: function(anInterpreter) {
          this.interpreterProxy = anInterpreter;
          this.primHandler = this.interpreterProxy.vm.primHandler;
          this.pointClass = this.interpreterProxy.vm.globalNamed("Point");
          this.associationClass = this.interpreterProxy.vm.globalNamed("Association");
          this.dictionaryClass = this.interpreterProxy.vm.globalNamed("Dictionary");
          this.domElementClass = null; // Only known after installation
          this.domRectangleClass = null; // Only known after installation
          this.systemPlugin = Squeak.externalModules.CpSystemPlugin;
          this.updateMakeStObject();
          this.preventDefaultEventHandling();
          this.runUpdateProcess();
          return true;
        },

        // Helper method for running a process uninterrupted
        runUninterrupted: function(process, endTime) {
          if(!process) {
            return;
          }

          // Run the specified process until the process goes
          // to sleep again or the end time is reached.
          // This 'runner' assumes the process runs 'quickly'.
          var primHandler = this.primHandler;
          primHandler.resume(process);
          var scheduler = primHandler.getScheduler();
          var vm = primHandler.vm;
          do {
            if(vm.method.compiled) {
              vm.method.compiled(vm);
            } else {
              vm.interpretOne();
            }
          } while(process === scheduler.pointers[Squeak.ProcSched_activeProcess] && (endTime === undefined || performance.now() < endTime));
        },

        // Helper methods for answering (and setting the stack correctly)
        answer: function(argCount, value) {
          this.interpreterProxy.popthenPush(argCount + 1, this.primHandler.makeStObject(value));
          return true;
        },
        answerSelf: function(argCount) {
          // Leave self on stack and only pop arguments
          this.interpreterProxy.pop(argCount);
          return true;
        },
        updateMakeStObject: function() {
          // Replace existing makeStObject function with more elaborate variant
          if(this.originalMakeStObject) {
            return;	// Already installed
          }
          var self = this;
          self.originalMakeStObject = this.primHandler.makeStObject;
          this.primHandler.makeStObject = function(obj, proxyClass) {
            if(obj !== undefined && obj !== null) {
              // Check for DOM element
              if(obj.tagName && obj.querySelectorAll) {
                return self.instanceForElement(obj);
              }
              // Check for Dictionary like element
              if(obj.constructor === Object && !obj.sqClass) {
                return self.makeStDictionary(obj);
              }
            }
            return self.originalMakeStObject.call(this, obj, proxyClass);
          };
        },
        makeStAssociation: function(key, value) {
          var association = this.interpreterProxy.vm.instantiateClass(this.associationClass, 0);
          // Assume instVars are #key and #value (in that order)
          association.pointers[0] = this.primHandler.makeStObject(key);
          association.pointers[1] = this.primHandler.makeStObject(value);
          return association;
        },
        makeStDictionary: function(obj) {
          var dictionary = this.interpreterProxy.vm.instantiateClass(this.dictionaryClass, 0);
          var keys = Object.keys(obj);
          var self = this;
          var associations = keys.map(function(key) {
            return self.makeStAssociation(key, obj[key]);
          });
          // Assume instVars are #tally and #array (in that order)
          var tally = dictionary.pointers[0] = keys.length;
          var array = dictionary.pointers[1] = this.primHandler.makeStArray(associations);
          return dictionary;
        },

        // Helper methods for namespaces
        namespaceForURI: function(uri) {
          return this.namespaces.find(function(namespace) {
            return namespace.uri === uri;
          });
        },
        namespaceForPrefix: function(prefix) {
          return this.namespaces.find(function(namespace) {
            return namespace.prefix === prefix;
          });
        },
        namespaceURIFromName: function(name) {
          var separatorIndex = name.indexOf(":");
          if(separatorIndex < 0) {
            return null;
          }
          var prefix = name.slice(0, separatorIndex);
          return this.namespaceForPrefix(prefix);
        },

        // Helper method to create a tag name from a class name
        tagNameFromClass: function(aClass) {

          // Remove camelCase and use dashes, all lowercase
          return aClass.className()
            .replace(/View$/, "")                 // Remove View as postfix for nicer readability
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
            .replace(/^([A-Za-z0-9]*)$/, "x-$1")  // Failsafe since custom tag name requires at least one hyphen
            .toLowerCase()
          ;
        },

        // Point helper methods
        getPointX: function(stPoint) {
          return stPoint.pointers[0];
        },
        getPointY: function(stPoint) {
          return stPoint.pointers[1];
        },

        // DOM element helper methods
        getDomElementClass: function() {
          if(!this.domElementClass) {
            this.domElementClass = this.interpreterProxy.vm.globalNamed("CpDomElement");
          }
          return this.domElementClass;
        },
        getDomRectangleClass: function() {
          if(!this.domRectangleClass) {
            this.domRectangleClass = this.interpreterProxy.vm.globalNamed("CpDomRectangle");
          }
          return this.domRectangleClass;
        },
        addElementClassMapper: function(mapper) {
          this.customElementClassMappers.push(mapper);
        },
        instanceForElement: function(element) {
          if(!element) return null;

          // Retrieve instance from DOM element itself
          if(element.__cp_element) {
            return element.__cp_element;
          }

          // Retrieve instance from DOM element map (if available and not GC'ed)
          var instance = this.domElementMap.get(element);
          if(instance === undefined) {

            // Create new instance and store in DOM element map
            var elementClass = this.customTagMap[element.localName];
            if(!elementClass) {
              this.customElementClassMappers.some(function(customElementClassMapper) {
                elementClass = customElementClassMapper(element);
                return elementClass !== null;
              });
            }
            if(!elementClass) {
              var namespace = this.namespaceForURI(element.namespaceURI);
              elementClass = namespace ? namespace.elementClass : this.getDomElementClass();
            }
            instance = this.interpreterProxy.vm.instantiateClass(elementClass, 0);
            instance.domElement = element;
            this.domElementMap.set(element, instance);
          }
          return instance;
        },
        makeDomRectangle: function(rectangle) {
          let domRectangleClass = this.getDomRectangleClass();
          let domRectangle = this.interpreterProxy.vm.instantiateClass(domRectangleClass, 0);
          let primHandler = this.primHandler;
          domRectangleClass.allInstVarNames().forEach(function(name, index) {
            if(rectangle[name] !== undefined) {
              domRectangle.pointers[index] = primHandler.makeStObject(rectangle[name]);
            }
          });
          return domRectangle;
        },

        // DOM element class methods
        "primitiveDomElementRegisterNamespace:forPrefix:": function(argCount) {
          if(argCount !== 2) return false;
          var namespaceURI = this.interpreterProxy.stackValue(1).asString();
          if(!namespaceURI) return false;
          var prefix = this.interpreterProxy.stackValue(0).asString();
          if(!prefix) return false;
          if(this.namespaceForPrefix(prefix)) {
            console.error("The prefix " + prefix + " is already installed in the browser");
            return false;
          }
          var receiver = this.interpreterProxy.stackValue(argCount);
          this.namespaces.push({ prefix: prefix, uri: namespaceURI, elementClass: receiver });
          return this.answerSelf(argCount);
        },
        "primitiveDomElementNewWithTag:": function(argCount) {
          if(argCount !== 1) return false;
          var tagName = this.interpreterProxy.stackValue(0).asString();
          if(!tagName) return false;
          var separatorIndex = tagName.indexOf(":");
          var prefix = separatorIndex >= 0 ? tagName.slice(0, separatorIndex) : tagName;
          if(separatorIndex >= 0 && prefix !== "xmlns") {
            tagName = tagName.slice(separatorIndex + 1);
          }
          var namespace = this.namespaceForPrefix(prefix);
          var element = !namespace || prefix === "xhtml" ?
            window.document.createElement(tagName) :
            window.document.createElementNS(namespace.uri, tagName)
          ;
          return this.answer(argCount, this.instanceForElement(element));
        },
        "primitiveDomElementDocument": function(argCount) {
          if(argCount !== 0) return false;
          var document = window.document;
          return this.answer(argCount, this.instanceForElement(document));
        },
        "primitiveDomElementElementsFromPoint:": function(argCount) {
          if(argCount !== 1) return false;
          var point = this.interpreterProxy.stackValue(0);
          if(point.sqClass !== this.pointClass) return false;
          var thisHandle = this;
          var elements = window.document.elementsFromPoint(this.getPointX(point), this.getPointY(point)).map(function(element) {
            return thisHandle.instanceForElement(element);
          });
          return this.answer(argCount, elements);
        },

        // DOM element instance methods
        "primitiveDomElementElementWithId:": function(argCount) {
          if(argCount !== 1) return false;
          var id = this.interpreterProxy.stackValue(0).asString();
          if(!id) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          // Check the receiver is a root element (this means it has an activeElement)
          if(!domElement || domElement.activeElement === undefined) return false;
          var element = domElement.getElementById(id);
          return this.answer(argCount, this.instanceForElement(element));
        },
        "primitiveDomElementAllDescendantsMatching:": function(argCount) {
          if(argCount !== 1) return false;
          var querySelector = this.interpreterProxy.stackValue(0).asString();
          if(!querySelector) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var thisHandle = this;
          var matchingElements = Array.from(domElement.querySelectorAll(querySelector))
            .map(function(matchingElement) {
              return thisHandle.instanceForElement(matchingElement);
            })
          ;
          return this.answer(argCount, matchingElements);
        },
        "primitiveDomElementFirstDescendantMatching:": function(argCount) {
          if(argCount !== 1) return false;
          var querySelector = this.interpreterProxy.stackValue(0).asString();
          if(!querySelector) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var firstMatchingElement = domElement.querySelector(querySelector);
          return this.answer(argCount, this.instanceForElement(firstMatchingElement));
        },
        "primitiveDomElementMatches:": function(argCount) {
          if(argCount !== 1) return false;
          var selector = this.interpreterProxy.stackValue(0).asString();
          if(!selector) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.matches(selector));
        },
        "primitiveDomElementParent": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var parentElement = domElement.parentElement;
          return this.answer(argCount, this.instanceForElement(parentElement));
        },
        "primitiveDomElementChildren": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var thisHandle = this;
          var childElements = Array.from(domElement.children)
            .map(function(childElement) {
              return thisHandle.instanceForElement(childElement);
            })
          ;
          return this.answer(argCount, childElements);
        },
        "primitiveDomElementPreviousSibling": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var siblingElement = domElement.previousElementSibling;
          return this.answer(argCount, this.instanceForElement(siblingElement));
        },
        "primitiveDomElementNextSibling": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var siblingElement = domElement.nextElementSibling;
          return this.answer(argCount, this.instanceForElement(siblingElement));
        },
        "primitiveDomElementTagName": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.localName || domElement.tagName || "--shadow--");
        },
        "primitiveDomElementId": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.id);
        },
        "primitiveDomElementId:": function(argCount) {
          if(argCount !== 1) return false;
          var id = this.interpreterProxy.stackValue(0).asString();
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement.id = id;
          return this.answerSelf(argCount);
        },
        "primitiveDomElementTextContent": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.textContent);
        },
        "primitiveDomElementTextContent:": function(argCount) {
          if(argCount !== 1) return false;
          var textContent = this.interpreterProxy.stackValue(0).asString();
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement.textContent = textContent;
          return this.answerSelf(argCount);
        },
        "primitiveDomElementMarkupContent": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.innerHTML);
        },
        "primitiveDomElementMarkupContent:": function(argCount) {
          if(argCount !== 1) return false;
          var content = this.interpreterProxy.stackValue(0);
          var markupContent = content.asString();
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement.innerHTML = markupContent;
          return this.answerSelf(argCount);
        },
        "primitiveDomElementIsClassed:": function(argCount) {
          if(argCount !== 1) return false;
          var className = this.interpreterProxy.stackValue(0).asString();
          if(!className) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.classList.contains(className));
        },
        "primitiveDomElementAddClass:": function(argCount) {
          if(argCount !== 1) return false;
          var className = this.interpreterProxy.stackValue(0).asString();
          if(!className) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement.classList.add(className);
          return this.answerSelf(argCount);
        },
        "primitiveDomElementRemoveClass:": function(argCount) {
          if(argCount !== 1) return false;
          var className = this.interpreterProxy.stackValue(0).asString();
          if(!className) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement.classList.remove(className);
          return this.answerSelf(argCount);
        },
        "primitiveDomElementAttributeAt:": function(argCount) {
          if(argCount !== 1) return false;
          var attributeName = this.interpreterProxy.stackValue(0).asString();
          if(!attributeName) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var namespaceURI = this.namespaceURIFromName(attributeName);
          var attributeValue;
          if(namespaceURI) {
            attributeValue = domElement.getAttributeNS(namespaceURI, attributeName);
          } else {
            attributeValue = domElement.getAttribute(attributeName);
          }
          return this.answer(argCount, attributeValue);
        },
        "primitiveDomElementAttributeAt:put:": function(argCount) {
          if(argCount !== 2) return false;
          var attributeName = this.interpreterProxy.stackValue(1).asString();
          if(!attributeName) return false;
          var value = this.interpreterProxy.stackValue(0);
          var attributeValue = value.isNil ? null: value.asString();
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var namespaceURI = this.namespaceURIFromName(attributeName);
          if(attributeValue === null) {
            if(namespaceURI) {
              domElement.removeAttributeNS(namespaceURI, attributeName);
            } else {
              domElement.removeAttribute(attributeName);
            }
          } else {
            if(namespaceURI) {
              domElement.setAttributeNS(namespaceURI, attributeName, attributeValue);
            } else {
              domElement.setAttribute(attributeName, attributeValue);
            }
          }
          return this.answerSelf(argCount);
        },
        "primitiveDomElementRemoveAttributeAt:": function(argCount) {
          if(argCount !== 1) return false;
          var attributeName = this.interpreterProxy.stackValue(0).asString();
          if(!attributeName) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var namespaceURI = this.namespaceURIFromName(attributeName);
          if(namespaceURI) {
            domElement.removeAttributeNS(namespaceURI, attributeName);
          } else {
            domElement.removeAttribute(attributeName);
          }
          return this.answerSelf(argCount);
        },
        "primitiveDomElementStyleAt:": function(argCount) {
          if(argCount !== 1) return false;
          var styleName = this.interpreterProxy.stackValue(0).asString();
          if(!styleName) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement.style.getPropertyValue(styleName) ||
              window.getComputedStyle(domElement).getPropertyValue(styleName));
        },
        "primitiveDomElementStyleAt:put:": function(argCount) {
          if(argCount !== 2) return false;
          var styleName = this.interpreterProxy.stackValue(1).asString();
          if(!styleName) return false;
          var value = this.interpreterProxy.stackValue(0);
          var styleValue = value.isNil ? null : value.asString();
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          if(styleValue === null) {
            domElement.style.removeProperty(styleName);
          } else {
            domElement.style.setProperty(styleName, styleValue);
          }
          return this.answerSelf(argCount);
        },
        "primitiveDomElementRemoveStyleAt:": function(argCount) {
          if(argCount !== 1) return false;
          var styleName = this.interpreterProxy.stackValue(0).asString();
          if(!styleName) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement.style.removeProperty(styleName);
          return this.answerSelf(argCount);
        },
        "primitiveDomElementPropertyAt:": function(argCount) {
          if(argCount !== 1) return false;
          var propertyName = this.interpreterProxy.stackValue(0).asString();
          if(!propertyName) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, domElement[propertyName]);
        },
        "primitiveDomElementPropertyAt:put:": function(argCount) {
          if(argCount !== 2) return false;
          var propertyName = this.interpreterProxy.stackValue(1).asString();
          if(!propertyName) return false;
          var propertyValue = this.systemPlugin.asJavascriptObject(this.interpreterProxy.stackValue(0));
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          domElement[propertyName] = propertyValue;
          return this.answerSelf(argCount);
        },
        "primitiveDomElementBoundingClientRectangle": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, this.makeDomRectangle(domElement.getBoundingClientRect()));
        },
        "primitiveDomElementClone": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, this.instanceForElement(domElement.cloneNode(true)));
        },
        "primitiveDomElementAppendChild:": function(argCount) {
          if(argCount !== 1) return false;
          var childInstance = this.interpreterProxy.stackValue(0);
          var childElement = childInstance.domElement;
          if(!childElement) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          if(domElement.children.length === 0 && domElement.childNodes.length > 0) {
            // Remove any existing text content when there are no children yet.
            // An element should either have text content or elements as 'content'.
            domElement.textContent = "";
          }
          domElement.appendChild(childElement);
          return this.answer(argCount, childInstance);
        },
        "primitiveDomElementInsertChild:before:": function(argCount) {
          if(argCount !== 2) return false;
          var childInstance = this.interpreterProxy.stackValue(1);
          var childElement = childInstance.domElement;
          if(!childElement) return false;
          var siblingElement = this.interpreterProxy.stackValue(0).domElement;
          if(!siblingElement) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement || siblingElement.parentElement !== domElement) return false;
          domElement.insertBefore(childElement, siblingElement);
          return this.answer(argCount, childInstance);
        },
        "primitiveDomElementReplaceChild:with:": function(argCount) {
          if(argCount !== 2) return false;
          var childElement = this.interpreterProxy.stackValue(1).domElement;
          if(!childElement) return false;
          var replacementInstance = this.interpreterProxy.stackValue(0);
          var replacementElement = replacementInstance.domElement;
          if(!replacementElement) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement || childElement.parentElement !== domElement) return false;
          domElement.replaceChild(replacementElement, childElement);
          return this.answer(argCount, replacementInstance);
        },
        "primitiveDomElementRemoveChild:": function(argCount) {
          if(argCount !== 1) return false;
          var childInstance = this.interpreterProxy.stackValue(0);
          var childElement = childInstance.domElement;
          if(!childElement) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          if(childElement.parentElement !== domElement) return false;
          domElement.removeChild(childElement);
          return this.answer(argCount, childInstance);
        },
        "primitiveDomElementUnRegisterAllInterest": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          delete domElement.__cp_events;
          delete domElement.__cp_element;
          return this.answerSelf(argCount);
        },
        "primitiveDomElementApply:withArguments:": function(argCount) {
          if(argCount !== 2) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var functionName = this.interpreterProxy.stackValue(1).asString();
          if(!functionName) return false;
          var functionArguments = this.systemPlugin.asJavascriptObject(this.interpreterProxy.stackValue(0));
          // Evaluate function in separate event cycle, preventing possible event to be generated outside the
          // Smalltalk execution thread. Sending #focus for example would synchronously execute the #focusin
          // event, which would get executed before this primitive is finished. It will leave the VM stack
          // unbalanced.
          window.setTimeout(function() { domElement[functionName].apply(domElement, functionArguments); }, 0);
          return this.answerSelf(argCount);
        },
        "primitiveDomElementSyncApply:withArguments:": function(argCount) {
          if(argCount !== 2) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          var functionName = this.interpreterProxy.stackValue(1).asString();
          if(!functionName) return false;
          var functionArguments = this.systemPlugin.asJavascriptObject(this.interpreterProxy.stackValue(0));
          // This is the 'unsafe' variant of primitiveDomElementApply. See the comment there. Use with care.
          // This variant is useful for performing getters.
          return this.answer(argCount, domElement[functionName].apply(domElement, functionArguments));
        },

        // HTMLElement class methods
        "primitiveHtmlElementDocumentHead": function(argCount) {
          if(argCount !== 0) return false;
          var documentHead = window.document.head;
          return this.answer(argCount, this.instanceForElement(documentHead));
        },
        "primitiveHtmlElementDocumentBody": function(argCount) {
          if(argCount !== 0) return false;
          var documentBody = window.document.body;
          return this.answer(argCount, this.instanceForElement(documentBody));
        },

        // WebComponent class methods
        "primitiveWebComponentRegister": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          if(receiver.customTag !== undefined) {
            console.error("Registering a WebComponent which already has a custom tag: " + receiver.customTag);
            return false;
          }

          // Keep track of custom tag and Smalltalk class
          var customTag = this.tagNameFromClass(receiver);
          receiver.customTag = customTag;
          this.customTagMap[customTag] = receiver;

          return this.answerSelf(argCount);
        },
        "primitiveWebComponentIsRegistered:": function(argCount) {
          if(argCount !== 1) return false;
          var tagName = this.interpreterProxy.stackValue(0).asString();
          var customClass = window.customElements.get(tagName);
          return this.answer(argCount, !!customClass);
        },
        "primitiveWebComponentTagName": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var tagName = this.tagNameFromClass(receiver);
          return this.answer(argCount, tagName);
        },
        "primitiveWebComponentShadowRoot": function(argCount) {
          if(argCount !== 0) return false;
          var domElement = this.interpreterProxy.stackValue(argCount).domElement;
          if(!domElement) return false;
          return this.answer(argCount, this.instanceForElement(domElement.shadowRoot));
        },

        // TemplateComponent helper methods
        ensureShadowRoot: function(elementClass, domElement) {

          // Attach shadow DOM (if not already presnet) and copy template (if available)
          if(!domElement.shadowRoot) {
            var shadowRoot = domElement.attachShadow({ mode: "open" });
            if(elementClass.templateElement) {
              shadowRoot.appendChild(elementClass.templateElement.cloneNode(true));
            }
          }
        },

        // TemplateComponent class methods
        "primitiveTemplateComponentRegisterStyleAndTemplate": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          if(receiver.customTag === undefined) {
            console.error("Registering a TemplateComponent without a custom tag");
            return false;
          }

          // Create custom class and register it
          var thisHandle = this;
          try {
            var customClass = class extends HTMLElement {
              constructor() {
                super();
                thisHandle.ensureShadowRoot(receiver, this);
              }
            };

            // Keep track of custom class
            window.customElements.define(receiver.customTag, customClass);
            customClass.sqClass = receiver;
          } catch(e) {
            console.error("Failed to create new custom element with tag " + receiver.customTag, e);
            return false;
          }

          return this.answerSelf(argCount);
        },
        "primitiveTemplateComponentInstallStyle:andTemplate:": function(argCount) {
          if(argCount !== 2) return false;
          var styleString = this.interpreterProxy.stackValue(1).asString();
          var templateString = this.interpreterProxy.stackValue(0).asString();
          var receiver = this.interpreterProxy.stackValue(argCount);

          // Set the style without installing it (this will happen when installing the template)
          receiver.style = styleString;

          // Install template and rerender al instances
          this.installTemplate(receiver, templateString);
          this.renderAllInstances(receiver);
          return this.answerSelf(argCount);
        },
        "primitiveTemplateComponentInstallStyle:": function(argCount) {
          if(argCount !== 1) return false;
          var styleString = this.interpreterProxy.stackValue(0).asString();
          var receiver = this.interpreterProxy.stackValue(argCount);
          receiver.style = styleString;
          this.installStyleInTemplate(receiver);
          this.renderAllInstances(receiver);
          return this.answerSelf(argCount);
        },
        installStyleInTemplate: function(webComponentClass) {

          // Retrieve templateElement
          var templateElement = webComponentClass.templateElement;
          if(!templateElement) {
            return;
          }

          // Create new style node from specified styleString
          var newStyleNode = window.document.createElement("style");
          newStyleNode.id = "cp-css--" + webComponentClass.customTag;
          newStyleNode.textContent = webComponentClass.style;

          // Replace existing styles or add new styles
          var oldStyleNode = templateElement.querySelector("#" + newStyleNode.id);
          if(oldStyleNode) {

            // Existing styles are replaced
            oldStyleNode.parentNode.replaceChild(newStyleNode, oldStyleNode);
          } else {

            // Insert the style to become the first element of the template
            templateElement.insertBefore(newStyleNode, templateElement.firstElementChild);
          }
        },
        "primitiveTemplateComponentInstallTemplate:": function(argCount) {
          if(argCount !== 1) return false;
          var templateString = this.interpreterProxy.stackValue(0).asString();
          var receiver = this.interpreterProxy.stackValue(argCount);
          this.installTemplate(receiver, templateString);
          this.renderAllInstances(receiver);
          return this.answerSelf(argCount);
        },
        installTemplate: function(webComponentClass, template) {

          // Create template node from specified template (String)
          // The DOM parser is very forgiving, so no need for try/catch here
          var domParser = new DOMParser();
          var templateElement = domParser.parseFromString("<template>" + (template || "") + "</template>", "text/html").querySelector("template").content;

          // Check for nested templates
          var customTags = Object.keys(this.customTagMap);
          var hasNestedTag = customTags.some(function(customTag) {
            return templateElement.querySelector(customTag) !== null;
          });

          // Add or remove receiver from collection of nested tags
          if(hasNestedTag) {
            this.nestedTags[webComponentClass.customTag] = true;
          } else {
            delete this.nestedTags[webComponentClass.customTag];
          }

          // Store the template node and update style (which is element within templateElement)
          webComponentClass.templateElement = templateElement;
          this.installStyleInTemplate(webComponentClass);
        },
        "primitiveTemplateComponentRenderAllInstances": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          if(!receiver.templateElement) return false;
          this.renderAllInstances(receiver);
          return this.answerSelf(argCount);
        },
        renderAllInstances: function(webComponentClass, root) {
          if(!root) {
            root = window.document;
          }

          // Render all direct instances
          var templateElement = webComponentClass.templateElement;
          var thisHandle = this;
          root.querySelectorAll(webComponentClass.customTag).forEach(function(instance) {
            thisHandle.renderTemplateOnElement(templateElement, instance);
          });

          // Render all nested instances
          Object.keys(this.nestedTags).forEach(function(nestedTag) {
            root.querySelectorAll(nestedTag).forEach(function(instance) {
              if(instance.shadowRoot) {
                thisHandle.renderAllInstances(webComponentClass, instance.shadowRoot);
              }
            });
          });
        },
        renderTemplateOnElement: function(templateElement, element) {

          // Remove existing content
          var shadowRoot = element.shadowRoot;
          while(shadowRoot.firstChild) {
            shadowRoot.firstChild.remove();
          }

          // Set new content using a copy of the template to prevent changes (by others) to persist
          shadowRoot.appendChild(templateElement.cloneNode(true));
        },

        // TemplateComponent instance methods
        "primitiveTemplateComponentEnsureShadowRoot": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var domElement = receiver.domElement;
          if(!domElement) return false;
          this.ensureShadowRoot(receiver.sqClass, domElement);
          return this.answerSelf(argCount);
        },

        // Update process
        runUpdateProcess: function() {
          let thisHandle = this;
          window.requestAnimationFrame(function() {
            var start = performance.now();
            thisHandle.handleEvents();
            // The total time spent in an animation frame should not be more than 16.666 ms.
            // Keep a little extra room and therefor limit execution to 16ms.
            // Transitions are less important than event handling.
            thisHandle.handleTransitions(start + 16);
            thisHandle.runUpdateProcess();
          });
        },
        handleEvents: function() {
          if(this.eventHandlerProcess && this.eventsReceived.length > 0) {
    var start = null;
    if(window.sessionStorage.getItem("DEBUG")) start = performance.now();
            this.runUninterrupted(this.eventHandlerProcess);
    if(start !== null) console.log("Event handler took " + (performance.now() - start) + "ms");
          }
        },

        // Event handling
        makeStEvent: function(eventObject) {

          // Create new instance and connect original event
          let event = eventObject.event;
          let eventDefinition = this.eventDefinitions[event.type];
          let newEvent = this.interpreterProxy.vm.instantiateClass(eventDefinition.eventClass, 0);
          newEvent.event = event;

          // Set event properties
          let primHandler = this.primHandler;
          eventDefinition.instVarNames.forEach(function(instVarName, index) {
            let value = eventObject.specials[instVarName];
            if(value === undefined) {
              value = event[instVarName];
            }
            if(value !== undefined && value !== null) {
              newEvent.pointers[index] = primHandler.makeStObject(value);
            }
          });

          return newEvent;
        },
        preventDefaultEventHandling: function() {
          let body = window.document.body;

          // Prevent default behavior for number of events
          [
            "contextmenu",
            "dragstart"	// Prevent Firefox (and maybe other browsers) from doing native drag/drop
          ].forEach(function(touchType) {
            body.addEventListener(
              touchType,
              function(event) {
                event.preventDefault();
              }
            );
          });
        },
        findInterestedElements: function(event) {
          let type = event.type;
          let elements = [];

          // Start searching for elements using composedPath because of shadow DOM
          let composedPath = (event.composedPath && event.composedPath()) || [];
          if(composedPath.length > 0) {
            let index = 0;
            let node = composedPath[index];
            while(node) {

              // Keep first element which is interested
              if(node.__cp_events && node.__cp_events.has(type)) {
                elements.push(node);
              }
              node = composedPath[++index];
            }
          } else {
            let node = event.target;
            while(node) {

              // Keep first element which is interested
              if(node.__cp_events && node.__cp_events.has(type)) {
                elements.push(node);
              }
              node = node.parentElement;
            }
          }

          // For mouse events, add elements which are beneath the current pointer.
          // Browsers don't do this by default. When an HTML element is directly
          // under the pointer, only this element and its predecessors are taken
          // into account. If HTML elements overlap because of positioning/placement
          // the elements beneath the top elements are out of luck. Let's show some
          // love and add them to the party of interested elements.
          // Check for MouseEvent using duck-typing (do NOT use pageX and pageY here
          // since some browsers still have these properties on UIEvent, see
          // https://docs.w3cub.com/dom/uievent/pagex).
          if(event.offsetX !== undefined && event.offsetY !== undefined) {
            document.elementsFromPoint(event.pageX, event.pageY).forEach(function(element) {
              if(element.__cp_events && element.__cp_events.has(type) && !elements.includes(element)) {
                // Find correct position within structure (leaf elements first, root element last).
                // Find common element (towards leafs and put new element directly after it).
                let commonElement = element.parentElement;
                let index = -1;
                while(commonElement && index < 0) {
                  index = elements.indexOf(commonElement);
                  commonElement = commonElement.parentElement;
                }
                if(index < 0) {
                  elements.push(element);
                } else {
                  elements.splice(index, 0, element);
                }
              }
            });
          }

          var thisHandle = this;
          return elements.map(function(element) { return thisHandle.instanceForElement(element); });
        },
        findTarget: function(event) {

          // Start searching for target using composedPath because of shadow DOM
          let composedPath = (event.composedPath && event.composedPath()) || [];
          if(composedPath.length > 0) {
            return this.instanceForElement(composedPath[0]);
          } else {
            return this.instanceForElement(event.target);
          }
        },
        addEvent: function(event) {

          // Add event object with a few special properties.
          // The modifiers property is added as a convenience to access all
          // modifiers through a single value.
          let eventObject = {
            event: event,
            specials: {
              modifiers:
                (event.altKey ? 1 : 0) +
                (event.ctrlKey ? 2 : 0) +
                (event.metaKey ? 4 : 0) +
                (event.shiftKey ? 8 : 0),
              // Fix 'issue' with click event because 'buttons' are not registered
              buttons: (event.type === "click" && event.detail > 0 ? ([ 1, 4, 2, 8, 16 ][event.button] || 1) : event.buttons),
              target: this.findTarget(event),
              elements: this.findInterestedElements(event),
              currentElementIndex: 1
            }
          };

          // Add or replace last event (if same type replace events as throttling mechanism)
          let type = event.type;
          if(this.eventsReceived.length > 0 && this.eventsReceived[this.eventsReceived.length - 1].event.type === type && this.throttleEventTypes.includes(type)) {
            this.eventsReceived[this.eventsReceived.length - 1] = eventObject;
          } else {
            this.eventsReceived.push(eventObject);
          }
        },
        handleEvent: function(event) {

          // Prevent the event from propagation (bubbling in this case).
          // This will be handled in the Smalltalk code itself.
          event.stopImmediatePropagation();

          // Add the event to the collection of events to handlee
          this.addEvent(event);

          // Directly handle the available events
          if(!this.throttleEventTypes.includes(event.type)) {
            this.handleEvents();
          }
        },

        // Event class methods
        "primitiveEventRegisterProcess:": function(argCount) {
          if(argCount !== 1) return false;
          this.eventHandlerProcess = this.interpreterProxy.stackValue(0);
          return this.answerSelf(argCount);
        },
        "primitiveEventRegisterClass:forType:": function(argCount) {
          if(argCount !== 2) return false;
          let type = this.interpreterProxy.stackValue(0).asString();
          let eventClass = this.interpreterProxy.stackValue(1);
          eventClass.type = type;
          this.eventDefinitions[type] = {
            eventClass: eventClass,
            instVarNames: eventClass.allInstVarNames()
          };
          return this.answerSelf(argCount);
        },
        "primitiveEventAddListenerTo:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var element = this.interpreterProxy.stackValue(0);
          var domElement = element.domElement;
          if(!domElement) return false;
          var eventName = receiver.type;
          if(!domElement.__cp_events) {
            domElement.__cp_events = new Set();
          }
          domElement.__cp_events.add(eventName);
          domElement.__cp_element = element;
          var thisHandle = this;
          domElement.addEventListener(eventName, function(event) {
            if(thisHandle.preventDefaultEventTypes.includes(event.type)) {
              event.preventDefault();
            }
            thisHandle.handleEvent(event);
          });
          return this.answerSelf(argCount);
        },
        "primitiveEventIsListenedToOn:": function(argCount) {
          if(argCount !== 1) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var element = this.interpreterProxy.stackValue(0);
          var domElement = element.domElement;
          if(!domElement) return false;
          var eventName = receiver.type;
          return this.answer(argCount, !!(domElement.__cp_events && domElement.__cp_events.has(eventName)));
        },
        "primitiveEventLatestEvents": function(argCount) {
          if(argCount !== 0) return false;

          // Answer event list and create empty list for future events
          var thisHandle = this;
          var result = this.primHandler.makeStArray(this.eventsReceived
            .map(function(event) {
              return thisHandle.makeStEvent(event);
            })
          );
          this.eventsReceived = [];

          return this.answer(argCount, result);
        },

        // Event instance methods
        "primitiveEventPreventDefault": function(argCount) {
          if(argCount !== 0) return false;
          var receiver = this.interpreterProxy.stackValue(argCount);
          var event = receiver.event;
          if(event) {
            event.preventDefault();
          }
          return this.answerSelf(argCount);
        },

        // Transition class methods
        "primitiveTransitionRegisterProcess:": function(argCount) {
          if(argCount !== 1) return false;
          this.transitionProcess = this.interpreterProxy.stackValue(0);
          this.transitionStartTick = performance.now();
          return this.answerSelf(argCount);
        },
        "primitiveTransitionTickCount": function(argCount) {
          if(argCount !== 0) return false;
          return this.answer(argCount, Math.ceil(performance.now() - this.transitionStartTick));
        },
        handleTransitions: function(endTime) {
          this.runUninterrupted(this.transitionProcess, endTime);
        }
      };
    }

    function registerCpDOMPlugin() {
        if(typeof Squeak === "object" && Squeak.registerExternalModule) {
            Squeak.registerExternalModule("CpDOMPlugin", CpDOMPlugin());
        } else self.setTimeout(registerCpDOMPlugin, 100);
    }
    registerCpDOMPlugin();

}());
