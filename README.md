# EntryScape

The web application [EntryScape](http://www.entryscape.com) is a Rich Internet Application that exposes the capabilities
of ReM3 and [EntryStore](http://www.entrystore.org) through its user interface.
It provides portfolios for individuals and groups. Each portfolio provides a place to store resources – in the form of
uploaded files, web content, physical entities or abstract concepts – together with descriptive metadata.
These resources can be private or shared with others and they can be connected to each other using predicates.

EntryScape is also known as "Confolio" from earlier projects.

##Getting started
###1. Check out the EntryScape code

    git clone git@bitbucket.org:metasolutions/entryscape.git

###2. Download the latest dojo

    cd lib
    ./INSTALL-dojo.sh

###3. Configure the main application

You configure the application by providing a `config`-folder. You can either use `config-example` without changes (by copying it to `config`), or base your own configuration on it.

###4. Deploy EntryScape
You need to deploy EntryScape in parallel to [EntryStore](https://bitbucket.org/metasolutions/entrystore) so it can do
Ajax requests to EntryStores REST services without being hindered by same-origin rules in the browser.
Since EntryStore is deployed in tomcat we recommend you to deploy EntryScape in tomcat as well.

    //Add the following in a file at TOMCAT_ROOT/conf/Catalina/localhost/scape.xml
    //You can use another context than scape if you so prefer.
    <Context
        path="/scape"
        docBase="/path/to/entryscape/root/"
        debug="2"
        privileged="true"
        reloadable="true"
        allowLinking="true">
    </Context>

###5. Point your browser to your installation:

    http://localhost:8080/scape

##Development
The two directories `src/rdfjson` and `src/rforms` originate from the rforms project and are added into the project via
the [git subtree merge strategy](https://www.kernel.org/pub/software/scm/git/docs/howto/using-merge-subtree.html).
Hence, never change any files in those directories directly. Instead make the changes
in the [RForms repository](https://bitbucket.org/metasolutions/rforms) and integrate the changes by making a:

    git pull -s subtree rforms master

And then commit and push as usual.
