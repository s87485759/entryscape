{mdid: "testdata/folder2-md.js", mmdid: "testdata/folder2-mmd.js", pid: "testdata/portfolio.js",
   md_stub: {label: "Folder 2"}, 
   mmd_stub: {type: "list"},
   children: [
     {rid: "testdata/person1", 
        mdid: "testdata/person1-md.js", mmdid: "testdata/person1-mmd.js",
        md_stub: {label: "Matthias Palmer", description: "A nice fellow.", type: "Person"}, 
        mmd_stub: {ir: "false"}},
     {rid: "http://example.com/person2", 
        mdid: "testdata/person2-md-cache.js", mmdid: "testdata/person2-mmd.js",
        md_stub: {label: "Hannes Ebner", description: "A nice fellow.", type: "Person"}, 
        mmd_stub: {ir: "false", source: "http://example.com/person2.js", cache: "20071114"}},    
   ]
}