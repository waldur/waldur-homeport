# BuildRequiresRepo: epel-release
# BuildRequiresRepo: https://rpm.nodesource.com/pub_4.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm

%define __conf_dir %{_sysconfdir}/%{name}
%define __data_dir %{_datadir}/%{name}

Name: waldur-homeport
Summary: Waldur HomePort
Version: 2.0.0
Release: 1
License: MIT
Source0: %{name}-%{version}.tar.gz

BuildArch: noarch
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot

BuildRequires: bzip2
BuildRequires: git
BuildRequires: libjpeg-turbo-devel
BuildRequires: libpng-devel
BuildRequires: libtool
BuildRequires: make
BuildRequires: nasm
BuildRequires: nodejs < 6
BuildRequires: rubygem-sass

%description
Web interface for Waldur MasterMind cloud orchestrator.

%prep
%setup -q

%build
npm install --global bower grunt-cli

npm install
bower --allow-root --no-color install

grunt prodbatch
grunt po2json_angular_translate

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}%{_datadir}
mkdir -p %{buildroot}%{__conf_dir}

cp packaging%{__conf_dir}/config.json %{buildroot}%{__conf_dir}
cp packaging%{__conf_dir}/nginx.conf %{buildroot}%{__conf_dir}

cp -r app %{buildroot}%{__data_dir}

%clean
rm -rf %{buildroot}

%files
%defattr(-,root,root,-)
%{__data_dir}
%config(noreplace) %{__conf_dir}/config.json
%config(noreplace) %{__conf_dir}/nginx.conf

%changelog
* Fri Dec 23 2016 Juri Hudolejev <juri@opennodecloud.com> - 2.0.0-1
- New upstream release

* Fri Nov 11 2016 Juri Hudolejev <juri@opennodecloud.com> - 0.1.0-1
- Initial version of the package
