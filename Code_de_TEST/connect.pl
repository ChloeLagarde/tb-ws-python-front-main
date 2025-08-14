use strict;
use warnings;
use CGI;
use LWP::UserAgent;

sub execute_snmp_command{
    my ($command) = @_;
    my $result = `$command`;

    if($?){
        return "Erreur lors de l'exécution de la commande SNMP : $!\n";
    }

    return "Résultat de la commande SNMP : $result\n";
}

sub ws_python{
    my($url) = @_;
    my $return;

    my $machine = `/bin/hostname`;

    chomp($machine);

    if ($machine =~ /vma-prdweb-12|vma-prdweb-34|vma-prdscr-50/){
        my $ua = LWP::UserAgent->new(
            ssl_opts => {
                verify_hostname => 0,
            },
        );

        $ua->timeout(60);
        $ua->env_proxy;
        $ua->proxy('https',"http://10.1.80.5:80");

        my $response = $ua->get($url);
        if($response->is_success){
            $return = $response->decoded_content;
        } else {
            warn "Requete  vers $url échouée : ".$response->status_line;
        }
    } else {
        warn "Machine non reconnue :  $machine"
    }

    return $return;
}

my $query = CGI->new;
my $url = $query->param('url'); 
my $snmp_command = $query->param('snmp_command');

if(defined $url && &url ne ''){
    my $dataToDisplay = ws_python($url);
    print "Donnée de wd_python: \n $dataToDisplay\n" if defined $dataToDisplay;
}elsif (defined $snmp_command && $snmp_command ne ''){
    my $snmpResult = execute_snmp_command($snmp_command);
    print$snmpResult if defined $snmpResult;
}