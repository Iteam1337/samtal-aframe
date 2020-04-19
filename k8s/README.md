## How to install ghost blog:

Install ghost in your cluster
    helm install samtal-ghost bitnami/ghost
    

Find out the generated passwords:
    export APP_PASSWORD=$(kubectl get secret --namespace default samtal-ghost -o jsonpath="{.data.ghost-password}" | base64 --decode)
    
    export APP_DATABASE_PASSWORD=$(kubectl get secret --namespace default samtal-ghost-mariadb -o jsonpath="{.data.mariadb-password}" | base64 --decode)

Set the host name manually:
    set APP_HOST=samtal.io

Run upgrade (still a bug in the annotations, `k get ingress samtal-ghost -o yaml` and then apply)
    helm upgrade samtal-ghost bitnami/ghost --set ingress.enabled=true --set ingress.certManager=true --set ingress.hosts[0].name=$APP_HOST --set ingress.hosts[0].tls=true  --set ghostHost=$APP_HOST --set ghostPassword=$APP_PASSWORD --set mariadb.db.password=$APP_DATABASE_PASSWORD --set ghostEmail=christian@landgren.nu --set ghost.image=ghost:3 --set tlsSecret=samtal-ghost-tls --set tlsHosts[0]=$APP_HOST --set ingress.annotations[0].name= --set ingress.annotations[0].value=letsencrypt-prod

